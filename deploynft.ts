import { readFileSync, writeFileSync } from 'fs'
import { HashLockNFT } from './src/contracts/hashLockNFT'
import { getDefaultSigner, randomPrivateKey } from './tests/utils/txHelper'
import {
    Addr,
    MethodCallOptions,
    PubKey,
    Sig,
    bsv,
    buildPublicKeyHashScript,
    findSig,
    hash160,
    sha256,
    toByteString,
} from 'scrypt-ts'
import { join } from 'path'
import { ContentType, OrdiMethodCallOptions, OrdiNFTP2PKH } from 'scrypt-ord'
import { myAddress } from './tests/utils/privateKey'
function readImage(): string {
    const path = join(__dirname, '..', '..', 'logo.png')
    return readFileSync(path).toString('base64')
}

async function main() {
    const [alicePrivateKey, alicePublicKey, pkh, myaddress] = randomPrivateKey()
    HashLockNFT.loadArtifact('tests/artifacts/contracts/hashLockNFT.json')

    // create contract instance
    const message = toByteString('Hello sCrypt', true)
    const hash = sha256(message)
    const hashLock = new HashLockNFT(hash)
    await hashLock.connect(getDefaultSigner(alicePrivateKey))

    // read image data
    const image = readImage()

    // inscribe image into contract instance
    const mintTx = await hashLock.inscribeImage(image, ContentType.PNG)
    console.log(`Mint tx: ${mintTx.id}`)

    const inscription = hashLock.getInscription()?.content as Buffer
    //getInscription().content as Buffer

    writeFileSync('inscription.png', inscription)

    // for now, the contract instance holds the image inscription
    // this inscription can be transferred only when the hash lock is solved
    const address = myAddress
    const receiver = new OrdiNFTP2PKH(Addr(address.toByteString()))

    const { tx: transferTx } = await hashLock.methods.unlock(message, {
        transfer: receiver,
    } as OrdiMethodCallOptions<HashLockNFT>)
    console.log(`Transfer tx: ${transferTx.id}`)
}

main()
