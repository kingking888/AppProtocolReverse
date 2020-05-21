# AndroidCertificatePinningKiller

## Android证书杀手
    
    Frida代码修改脚本，可用于绕过Android环境中的证书。使用此脚本，所有证书都将被视为可信证书。可以使用此脚本绕过以下证书固定库：
    
    Android的默认库
    OKHttp库
    Frida可在无根和有根证书Android设备上使用。此脚本已在TLSConnector [2,3]上进行了测试。
    
    用法：frida -U -l bypassCertificatePinningAndroid.js -f org.package.name --no-pause
    
    [1] = https://frida.re/
    [2] = https://github.com/CeesMandjes/TLSConnector
    [3] = https://github.com/CeesMandjes/TLSConnectorServer

