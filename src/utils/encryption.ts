export function generateEncryptionKey() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function generateIV() {
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function encryptData(data: any, key: string, iv: string): Promise<string> {
  try {
    const keyBuffer = new Uint8Array(key.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const ivBuffer = new Uint8Array(iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const contentBuffer = new TextEncoder().encode(JSON.stringify(data));

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer
      },
      cryptoKey,
      contentBuffer
    );

    return btoa(String.fromCharCode(...new Uint8Array(encryptedContent)));
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

export async function decryptData(encryptedData: string, key: string, iv: string): Promise<any> {
  try {
    const keyBuffer = new Uint8Array(key.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const ivBuffer = new Uint8Array(iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer
      },
      cryptoKey,
      encryptedBuffer
    );

    return JSON.parse(new TextDecoder().decode(decryptedContent));
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}

export async function generateKeyPair(): Promise<{publicKey: string, privateKey: string}> {
  try {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );

    const publicKeyExported = await crypto.subtle.exportKey(
      "spki", 
      keyPair.publicKey
    );
    
    const privateKeyExported = await crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey
    );

    const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyExported)));
    const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKeyExported)));

    return {
      publicKey: publicKeyBase64,
      privateKey: privateKeyBase64
    };
  } catch (error) {
    console.error('Anahtar çifti oluşturma hatası:', error);
    throw error;
  }
}

export async function importPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
  try {
    const binaryPublicKey = Uint8Array.from(atob(publicKeyBase64), c => c.charCodeAt(0));
    
    return await crypto.subtle.importKey(
      "spki",
      binaryPublicKey,
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      true,
      ["encrypt"]
    );
  } catch (error) {
    console.error('Public key import hatası:', error);
    throw error;
  }
}

export async function importPrivateKey(privateKeyBase64: string): Promise<CryptoKey> {
  try {
    const binaryPrivateKey = Uint8Array.from(atob(privateKeyBase64), c => c.charCodeAt(0));
    
    return await crypto.subtle.importKey(
      "pkcs8",
      binaryPrivateKey,
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      true,
      ["decrypt"]
    );
  } catch (error) {
    console.error('Private key import hatası:', error);
    throw error;
  }
}

export async function encryptWithPublicKey(data: any, publicKeyBase64: string): Promise<{encryptedData: string, encryptedKey: string}> {
  try {
    const dataBuffer = new TextEncoder().encode(JSON.stringify(data));
    
    const aesKey = await crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv
      },
      aesKey,
      dataBuffer
    );
    
    const exportedAesKey = await crypto.subtle.exportKey("raw", aesKey);
    
    const publicKey = await importPublicKey(publicKeyBase64);
    
    const encryptedKey = await crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      publicKey,
      exportedAesKey
    );
    
    const encryptedDataWithIV = new Uint8Array(iv.length + encryptedData.byteLength);
    encryptedDataWithIV.set(iv);
    encryptedDataWithIV.set(new Uint8Array(encryptedData), iv.length);
    
    return {
      encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedDataWithIV))),
      encryptedKey: btoa(String.fromCharCode(...new Uint8Array(encryptedKey)))
    };
  } catch (error) {
    console.error('Şifreleme hatası:', error);
    throw error;
  }
}

export async function decryptWithPrivateKey(encryptedData: string, encryptedKey: string, privateKeyBase64: string): Promise<any> {
  try {
    const encryptedDataWithIV = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const encryptedKeyBinary = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));
    
    const iv = encryptedDataWithIV.slice(0, 12);
    const actualEncryptedData = encryptedDataWithIV.slice(12);
    
    const privateKey = await importPrivateKey(privateKeyBase64);
    
    const decryptedKeyBuffer = await crypto.subtle.decrypt(
      {
        name: "RSA-OAEP"
      },
      privateKey,
      encryptedKeyBinary
    );
    
    const aesKey = await crypto.subtle.importKey(
      "raw",
      decryptedKeyBuffer,
      {
        name: "AES-GCM",
        length: 256
      },
      false,
      ["decrypt"]
    );
    
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv
      },
      aesKey,
      actualEncryptedData
    );
    
    return JSON.parse(new TextDecoder().decode(decryptedData));
  } catch (error) {
    console.error('Şifre çözme hatası:', error);
    throw error;
  }
}

/**
 * Kullanıcı tarafında anahtar çiftini yerel depolamaya (localStorage) kaydeder
 * localStorage kullanılamıyorsa, sessiz bir şekilde başarısız olur
 */
export function storeKeyPair(publicKey: string, privateKey: string, scope: string = 'default'): boolean {
  try {
    // Önce localStorage'ın kullanılabilir olup olmadığını kontrol et
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage kullanılamıyor - anahtarlar saklanamayacak');
      return false;
    }
    
    // Örnek yazma işlemi ile erişimi test et
    localStorage.setItem('storage_test', 'test');
    localStorage.removeItem('storage_test');
    
    // Anahtarları kaydet
    localStorage.setItem(`e2e_public_key_${scope}`, publicKey);
    localStorage.setItem(`e2e_private_key_${scope}`, privateKey);
    return true;
  } catch (error) {
    console.warn('Anahtar çifti saklanamadı:', error);
    return false;
  }
}

/**
 * Kullanıcı tarafında anahtar çiftini yerel depolamadan (localStorage) alır
 * localStorage kullanılamıyorsa, boş değerler döndürür
 */
export function retrieveKeyPair(scope: string = 'default'): {publicKey: string | null, privateKey: string | null} {
  try {
    // Önce localStorage'ın kullanılabilir olup olmadığını kontrol et
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage kullanılamıyor - anahtarlar alınamayacak');
      return { publicKey: null, privateKey: null };
    }
    
    // Örnek okuma işlemi ile erişimi test et
    localStorage.setItem('storage_test', 'test');
    localStorage.removeItem('storage_test');
    
    // Anahtarları getir
    const publicKey = localStorage.getItem(`e2e_public_key_${scope}`);
    const privateKey = localStorage.getItem(`e2e_private_key_${scope}`);
    return { publicKey, privateKey };
  } catch (error) {
    console.warn('Anahtar çifti alınamadı:', error);
    return { publicKey: null, privateKey: null };
  }
}

/**
 * Kullanıcı tarafından anahtarların başlatılmasını denetler
 * Anahtarlar yoksa yeni oluşturur ve saklar
 * localStorage kullanılamıyorsa bile çalışmaya devam eder
 */
export async function initializeKeyPair(scope: string = 'default'): Promise<{publicKey: string, privateKey: string}> {
  try {
    // Önce mevcut anahtarları almayı dene
    const { publicKey, privateKey } = retrieveKeyPair(scope);
    
    if (publicKey && privateKey) {
      return { publicKey, privateKey };
    }
    
    // Mevcut anahtarlar yoksa yenilerini oluştur
    const newKeyPair = await generateKeyPair();
    
    // Anahtarları saklamayı dene (başarısız olsa bile devam et)
    storeKeyPair(newKeyPair.publicKey, newKeyPair.privateKey, scope);
    
    return newKeyPair;
  } catch (error) {
    console.error('Anahtar çifti başlatma hatası:', error);
    
    // Hata olsa bile yeni bir anahtar çifti oluştur ve döndür
    // Bu sadece bu oturum için geçerli olacak (saklanamayacak)
    try {
      return await generateKeyPair();
    } catch (fallbackError) {
      console.error('Anahtar çifti oluşturma kritik hatası:', fallbackError);
      throw new Error('Şifreleme anahtarları oluşturulamadı. Tarayıcınız Web Cryptography API\'yi desteklemiyor olabilir.');
    }
  }
}

export async function encryptFile(file: File, publicKeyBase64: string): Promise<{encryptedFile: Blob, encryptedKey: string}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);
    
    const aesKey = await crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv
      },
      aesKey,
      fileData
    );
    
    const exportedAesKey = await crypto.subtle.exportKey("raw", aesKey);
    
    const publicKey = await importPublicKey(publicKeyBase64);
    
    const encryptedKey = await crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      publicKey,
      exportedAesKey
    );
    
    const encryptedDataWithIV = new Uint8Array(iv.length + encryptedData.byteLength);
    encryptedDataWithIV.set(iv);
    encryptedDataWithIV.set(new Uint8Array(encryptedData), iv.length);
    
    return {
      encryptedFile: new Blob([encryptedDataWithIV], { type: 'application/octet-stream' }),
      encryptedKey: btoa(String.fromCharCode(...new Uint8Array(encryptedKey)))
    };
  } catch (error) {
    console.error('Dosya şifreleme hatası:', error);
    throw error;
  }
}

export async function decryptFile(encryptedFile: Blob, encryptedKey: string, privateKeyBase64: string, mimeType: string = 'application/octet-stream'): Promise<Blob> {
  try {
    console.log('decryptFile başladı. Dosya tipi:', encryptedFile.type, 'boyut:', encryptedFile.size);
    
    const arrayBuffer = await encryptedFile.arrayBuffer();
    console.log('Dosya buffer alındı. Boyut:', arrayBuffer.byteLength);
    
    const encryptedDataWithIV = new Uint8Array(arrayBuffer);
    
    // IV'nin (Initialization Vector) doğru olup olmadığını kontrol et
    const iv = encryptedDataWithIV.slice(0, 12);
    console.log('IV alındı. Boyut:', iv.length, 'IV:', Array.from(iv).join(','));
    
    const actualEncryptedData = encryptedDataWithIV.slice(12);
    console.log('Şifreli veri alındı. Boyut:', actualEncryptedData.length);
    
    console.log('encryptedKey uzunluğu:', encryptedKey.length);
    
    try {
      const encryptedKeyBinary = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));
      console.log('Şifreli anahtar binary formata dönüştürüldü. Boyut:', encryptedKeyBinary.length);
      
      const privateKey = await importPrivateKey(privateKeyBase64);
      console.log('Özel anahtar içe aktarıldı');
      
      try {
        const decryptedKeyBuffer = await crypto.subtle.decrypt(
          {
            name: "RSA-OAEP"
          },
          privateKey,
          encryptedKeyBinary
        );
        console.log('AES anahtarı çözüldü. Boyut:', decryptedKeyBuffer.byteLength);
        
        try {
          const aesKey = await crypto.subtle.importKey(
            "raw",
            decryptedKeyBuffer,
            {
              name: "AES-GCM",
              length: 256
            },
            false,
            ["decrypt"]
          );
          console.log('AES anahtarı içe aktarıldı');
          
          try {
            console.log('Veri çözme işlemi başlıyor...');
            const decryptedData = await crypto.subtle.decrypt(
              {
                name: "AES-GCM",
                iv
              },
              aesKey,
              actualEncryptedData
            );
            console.log('Veri başarıyla çözüldü. Boyut:', decryptedData.byteLength);
            
            return new Blob([decryptedData], { type: mimeType });
          } catch (error) {
            console.error('AES-GCM veri çözme hatası:', error);
            throw error;
          }
        } catch (error) {
          console.error('AES anahtarı içe aktarma hatası:', error);
          throw error;
        }
      } catch (error) {
        console.error('RSA-OAEP anahtar çözme hatası:', error);
        throw error;
      }
    } catch (error) {
      console.error('Binary anahtar dönüştürme hatası:', error);
      throw error;
    }
  } catch (error) {
    console.error('Dosya çözme hatası:', error);
    throw error;
  }
} 