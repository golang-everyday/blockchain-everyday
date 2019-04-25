

##### 在最新的go版本中,和fabric-go-sdk一块启动的时候会报错。原因是底层一段代码出问题,
找到对应的代码函数，进行替换即可。
##### 初步原因：源码少个参数。

```go
func (s *System) startMetricsTickers() error {
	m := s.options.Metrics
	if s.statsd != nil {
		network := m.Statsd.Network
		address := m.Statsd.Address
		c, err := net.Dial(network, address)
		if err != nil {
			return err
		}
		c.Close()

		opts := s.options.Metrics.Statsd
		writeInterval := opts.WriteInterval
		//
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		//
		s.collectorTicker = time.NewTicker(writeInterval / 2)
		goCollector := goruntime.NewCollector(s.Provider)
		go goCollector.CollectAndPublish(s.collectorTicker.C)

		s.sendTicker = time.NewTicker(writeInterval)
		go s.statsd.SendLoop(ctx,s.sendTicker.C, network, address)
	}

	return nil
}
```

