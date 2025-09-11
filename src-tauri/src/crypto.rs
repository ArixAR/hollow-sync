use aes::Aes256;
use aes::cipher::{generic_array::GenericArray, BlockEncrypt, BlockDecrypt, KeyInit};
use base64::{Engine as _, engine::general_purpose};

// thx @bloodorca <https://github.com/bloodorca/hollow/blob/master/src/functions.js#L4-L105>
const ENCRYPTION_KEY: &str = "UKu52ePUBwetZ9wNX88o54dnfKRu0T1l";
const SAVE_HEADER: [u8; 22] = [0, 1, 0, 0, 0, 255, 255, 255, 255, 1, 0, 0, 0, 0, 0, 0, 0, 6, 1, 0, 0, 0];

pub struct SaveCrypto {
    cipher: Aes256,
}

impl SaveCrypto {
    pub fn new() -> Self {
        let key = GenericArray::from_slice(ENCRYPTION_KEY.as_bytes());
        let cipher = Aes256::new(key);
        Self { cipher }
    }

    pub fn encrypt(&self, data: &[u8]) -> Vec<u8> {
        let padding = 16 - (data.len() % 16);
        let mut padded = vec![padding as u8; data.len() + padding];
        padded[..data.len()].copy_from_slice(data);

        let mut result = Vec::new();
        for chunk in padded.chunks(16) {
            let mut block = GenericArray::clone_from_slice(chunk);
            self.cipher.encrypt_block(&mut block);
            result.extend_from_slice(&block);
        }
        result
    }

    pub fn decrypt(&self, data: &[u8]) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
        if data.len() % 16 != 0 {
            return Err("Invalid encrypted data length".into());
        }

        let mut result = Vec::new();
        for chunk in data.chunks(16) {
            let mut block = GenericArray::clone_from_slice(chunk);
            self.cipher.decrypt_block(&mut block);
            result.extend_from_slice(&block);
        }

        if let Some(&padding) = result.last() {
            if padding as usize <= result.len() {
                result.truncate(result.len() - padding as usize);
            }
        }

        Ok(result)
    }

    pub fn create_length_prefix(length: usize) -> Vec<u8> {
        let mut bytes = Vec::new();
        let mut len = length;
        
        while len >= 0x80 {
            bytes.push(((len & 0x7F) | 0x80) as u8);
            len >>= 7;
        }
        bytes.push((len & 0x7F) as u8);
        bytes
    }

    pub fn add_save_header(data: &[u8]) -> Vec<u8> {
        let length_bytes = Self::create_length_prefix(data.len());
        let mut result = Vec::with_capacity(SAVE_HEADER.len() + length_bytes.len() + data.len() + 1);
        
        result.extend_from_slice(&SAVE_HEADER);
        result.extend_from_slice(&length_bytes);
        result.extend_from_slice(data);
        result.push(11);
        
        result
    }

    pub fn remove_save_header(data: &[u8]) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
        if data.len() <= SAVE_HEADER.len() {
            return Err("Data too short to contain header".into());
        }

        let mut header_end = SAVE_HEADER.len();
        
        // variable length prefix parsing
        for i in 0..5 {
            if header_end >= data.len() {
                return Err("Invalid header format".into());
            }
            header_end += 1;
            if (data[SAVE_HEADER.len() + i] & 0x80) == 0 {
                break;
            }
        }
        
        if header_end >= data.len() {
            return Err("Header extends beyond data".into());
        }

        Ok(data[header_end..data.len()-1].to_vec())
    }

    pub fn pc_to_switch(&self, pc_save_data: &[u8]) -> Result<String, Box<dyn std::error::Error>> {
        let without_header = Self::remove_save_header(pc_save_data)?;
        let base64_data = String::from_utf8(without_header)?;
        let encrypted_data = general_purpose::STANDARD.decode(&base64_data)?;
        let json_data = self.decrypt(&encrypted_data)?;
        Ok(String::from_utf8(json_data)?)
    }

    pub fn switch_to_pc(&self, json_string: &str) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
        let json_data = json_string.as_bytes();
        let encrypted_data = self.encrypt(json_data);
        let base64_string = general_purpose::STANDARD.encode(&encrypted_data);
        let base64_data = base64_string.as_bytes();
        Ok(Self::add_save_header(base64_data))
    }
}