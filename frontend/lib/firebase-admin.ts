import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export function getFirebaseAdminApp() {
    if (getApps().length === 0) {
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        let credential;
        if (serviceAccountKey) {
            try {
                credential = cert(JSON.parse(serviceAccountKey));
            } catch (e) {
                console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY", e);
            }
        }

        if (!credential) {
            console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not found or invalid. Using mock for build/dev.");
            // Mock credential for build time
            credential = cert({
                projectId: "mock-project",
                clientEmail: "mock@example.com",
                privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDAs0lDF3s6Pb8q\ntb82J6jgbKJK1Rx4OoO5BxARe57UegwTODxqlLqQvsmDIu2SRZZ8++h1NjLC4iKn\n3NtKPoxNEiolu9y6nzneokPVxMvuym6+m6Cd60+PWvqLgmeTwlOWz1F3olyjI4KO\n+feB7d+zpPSrWsPgdlhuknbcHVNCaIwIdYtgxyz96f2shEzKj6qTAxqMPc+q82Ni\nh4huIGa9cOCZ+jA9+91SCNNSJw6S3B600Ah0NwRPiV/cJyZ2Fr+PITitizCLTNyy\n1CHYDHd3sqJLIHB3//qW7XyHp1WADmniPRWTCWsJTiSTuHMJrhBNXvHn1VsJn+u/\nPjq+E+VzAgMBAAECggEAJyXFIm4oyKI2rfSSTewssLshFVbKG9q3W+WFbCfTEpNg\n1J6+F2Dzreg0hAGahfbBJc7/YKCMG29ZXwTNP/4I/rdL/LJ3myox1XrdkRYT4AUc\nDnkLXkmpthPjhmgNpsT5uk+P22AOtc3G/kjl8W1j3tkKI62i0Xz5Zi03HGyQt5Ku\nubAV/mJi2M3GYQPzYWuXeQAPLXX/zvRYDmncG6Z8x/qo9nw3BuLEn2bNeWs87cQC\n1LhbFHmbrLFsMldyYtmAv2aYUE/TQn+iVgiQNp5lZ81XFVrOSdySBUgtLUtrnC9K\nsswjNiZpRogSliOrLTYvg+Xr+gUEUCocv3gb+DwvgQKBgQD79Fkvj8VaQ2ZZPG97\nQLvOmBMsnDnoF1MmOGhgH6zV4kEYP07WufXF2f3joYaDyFdFHh0KpYntn6U65kDO\njw1qNRccQv8hhogF1rifLRgbVThUCGh7uu5pHxDmxQ/+lStV9uJ/PBEWqR438/WM\nV/K3ckZI0VGBnhdoAvRyFlpc0wKBgQDDy2AV2zqjGPMaU/a9DbZO3+ltT/CTTT+7\n5nDxXNKLFDBXYzjqKkWhSoWrlJ4c3X9+Pf9UeHvJE9rl2/LxX6yf0rnvrLoPW8bw\nNWJrCIF0IJQ/DqbPxQ0IYFKsf2XAra/CxqanD/zquDmX+pbEX/Lc/PyXF37rqfBT\n3bpueERw4QKBgHuPnZ1hmJtnqm3g4ZtEZ9YtZlneU9eqeLCpwSZC4nQR/XJyuas8\nj3d0LLrRoDJIsePHnN53yGisfk+gU+/4389SMf8+K/i5DUQvxWLqroPZC0LKzNLB\nHeKXxaYmxm1HonUKGpHjV04RqiwujCFDkFi+xhE39gznBvuPV2oL5EzZAoGAXuxR\nqCcCFaJ58dC1NdDZCwJZbAquiuuPs6w0I4Ap/w2JpkRPio919I1potbJlRr5vZ2X\nFT/YW5MJtBjffpAw48dJJ96o0dtf5oMrNNMJ1+AXnz6eNurEt8PjMQgOr8xFAvxG\nPYZtyuoH2hu+TnRqDSOF3kag3OYlwrMjuH0MSWECgYEAgSht2CyKIEApIfvsx54c\nWuuj0G3qImb5etZzDdQ4DovWCHcnhUG2T7yZioZhDr0xTvgd0ckjubpZ8l08G1Hu\njkqWA3hlUHCiF4eGmSejDv8JTfQt/PFdUZWeD8O3msHaxKz/ckvZJY/CkLu+4ehK\ncd0P6iyZVlJL8Fh7i/g6dw4=\n-----END PRIVATE KEY-----"
            });
        }

        return initializeApp({
            credential,
        });
    }
    return getApp();
}

export function getAdminFirestore() {
    return getFirestore(getFirebaseAdminApp());
}
