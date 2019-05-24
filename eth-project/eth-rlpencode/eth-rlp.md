### RLP

- 以太坊RLP编码的坑
  - rlp编码对空指针的解码会报错，所以要编码的对象最好不要有指针类型。
  - rlp对`[]byte`的支持也是，如果某字段是`[]byte`类型，而且值是`nil`，那么编码后再解码就会变成非空的：`[]byte{}`
  - rlp不支持`time.Duration`、`int`类型, 支持`uint`

# RLP编解码

以太坊标准的RLP编解码

> ```
> github.com/ethereum/go-ethereum/rlp
> ```

在使用Nodejs进行相应开发时，应当采用相应标准的以太坊第三方API

> github.com/ethereumjs/rlp
>
> npm install rlp

Go

```go
func TestRlpResult(t *testing.T){
	data := string("Hello PalletOne,Hi PTN")
	bytes, _ := rlp.EncodeToBytes(data)
	t.Logf("Rlp data:%x", bytes)
    //Rlp data:9648656c6c6f2050616c6c65744f6e652c48692050544e
	result := ""
	err := rlp.DecodeBytes(bytes, &result)
	assert.Nil(t, err)
	t.Logf("result data:%s", result)
    //result data:Hello PalletOne,Hi PTN
}
```

Nodejs

```js
var RLP = require('rlp')

var RLPData = "9648656c6c6f2050616c6c65744f6e652c48692050544e"

const buf = Buffer.from(RLPData, 'hex')
var result = RLP.decode(buf)
console.log(result.toString())
//Hello PalletOne,Hi PTN
```

```js
var RLP = require('rlp')

var data = "Hello PalletOne,Hi PTN"
var rlpdata = RLP.encode(data)
//9648656c6c6f2050616c6c65744f6e652c48692050544e
console.log(rlpdata.toString('hex'))
//const buf = Buffer.from(RLPData, 'hex')
var result = RLP.decode(rlpdata)
console.log(result.toString())
```



