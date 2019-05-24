# 哈希运算和数字签名

以太坊实现Keccak 256 哈希算法，ECDSA 椭圆曲线数字签名算法流程   此例子公私钥体制并不是以太坊标准

Go

```go
func TestRlpResult(t *testing.T){
	data := string("Hello PalletOne,Hi PTN")
	bytes, _ := rlp.EncodeToBytes(data)
	t.Logf("Rlp data:%x", bytes)

	privateKey := "Kx5BifY6Fz8UaGDS2VegdksYfXHhdWsWfEhEyVW3QqPiarnwRM2s"

	prvKey, _ := crypto.FromWIF(privateKey)
    hash := crypto.Keccak256(bytes)
	t.Log("hash is: " + hexutil.Encode(hash))
    //0x3d5ba7dea0ef64aea3d6f48fc50bbcd4b137efc5cd8fc7668fab425e744da666
	signature, _ := crypto.Sign(hash, prvKey)
	t.Log("Signature is: " + hexutil.Encode(signature))
    //0xff1272746442be12e87e5c6e31f0abb87a9b877b24de1f57a5fba111c1bcdc3d27af77d96c207eba0b81efcccc7cc1425a2bdedcfce5919fef9c5ca7b146029f01
}
```

Nodejs

```js
var RLP = require('rlp')
const { keccak256, ecsign} = require('ethereumjs-util')
var data = "Hello PalletOne,Hi PTN"
var rlpdata = RLP.encode(data)
console.log(rlpdata.toString('hex'))
const privKey = Buffer.alloc(32, '1973a11dc782d83281af10b97b0c208f49d9598af40bc91aee3cb1628bd60578', 'hex')
const sign = (msgHash, privKey) => {
  if (typeof msgHash === 'string' && msgHash.slice(0, 2) === '0x') {
    msgHash = Buffer.alloc(32, msgHash.slice(2), 'hex')
  }
  const sig = ecsign(msgHash, privKey)
  return `0x${sig.r.toString('hex')}${sig.s.toString('hex')}${sig.v.toString(16)}`
}
const hash = '0x' + keccak256(rlpdata).toString('hex')
console.log(hash.toString('hex'))
//0x3d5ba7dea0ef64aea3d6f48fc50bbcd4b137efc5cd8fc7668fab425e744da666
const sig = sign(hash, privKey)
console.log(sig.toString('hex'))
//0xff1272746442be12e87e5c6e31f0abb87a9b877b24de1f57a5fba111c1bcdc3d27af77d96c207eba0b81efcccc7cc1425a2bdedcfce5919fef9c5ca7b146029f01
```

