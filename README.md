# AppProtocolReverse

    App传输协议逆向
    利用frida hook java jdk 中的加密函数与方法，打印响应参数进行分析，还原算法，
    脚本中包含了MD5 AES DES RSA 等一些列加密算法，以及解决app无法抓包的sslping脚本。

## Steps

    1. frida启动脚本。
        frida -U -l protocol_hook.js -f libcms.so --no-pause
    2. 启动app点击发送请求，查看响应日志。
   
    3. 还原算法，测试代码在AppProtocolReverse\RegressionAlgorithm\script下。

