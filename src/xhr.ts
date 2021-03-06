import {AxiosPromise, AxiosRequestConfig, AxiosResponse} from './types'
import {parseHeaders} from './helpers/headers'
import { createError } from './helpers/error'
export default function xhr(config: AxiosRequestConfig):AxiosPromise{
    return new Promise((resolve, reject)=>{
        function handleResponse(response: AxiosResponse) {
            if (response.status >= 200 && response.status < 300) {
                resolve(response)
            } else {
                reject(createError(
                    `Request failed with status code ${response.status}`,
                    config,
                    null,
                    request,
                    response
                ))
            }
        }
        const {data=null,url,method='get',headers,timeout} = config
        const request = new XMLHttpRequest()
        if (timeout) {
            request.timeout = timeout
        }
        request.open(method.toUpperCase(),url,true)
        request.onreadystatechange = function handleLoad(){
            if(request.readyState!==4){
                return
            }
            if (request.status === 0) {
                return
            }
            const responseHeaders = parseHeaders(request.getAllResponseHeaders())
            const responseData = this.responseType&&this.responseType!=='text'?request.response:request.responseText
            const response: AxiosResponse = {
                data: responseData,
                status: request.status,
                statusText: request.statusText,
                headers: responseHeaders,
                config,
                request
            }
            handleResponse(response)
        }
        request.onerror = function handleError() {
            reject(createError(
                'Network Error',
                config,
                null,
                request
            ))
        }

        request.ontimeout = function handleTimeout() {
            reject(createError(
                `Timeout of ${config.timeout} ms exceeded`,
                config,
                'ECONNABORTED',
                request
            ))
        }
        Object.keys(headers).forEach((name)=>{
            if(data===null&&name.toLowerCase()==='content-type'){
                delete headers[name]
            }else{
                request.setRequestHeader(name,headers[name])
            }
        })
        request.send(data)
    })
}