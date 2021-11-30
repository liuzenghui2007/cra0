import React from "react";
import { Button, Row, Col, Select, message, Result } from "antd";
import Alert from "../common/Alert";
import "./index.css"
// const { confirm } = Modal;

const { Option } = Select;

//调用高拍仪使用webapi
export class CameraItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            defalutSelectedDevice: '',
            mediaDeviceList: [],
            deviceId: "",
            mediaStream: null,
            deviceActive: false,
            tips: "",
            // 逻辑
            arm: 0,
            circles: [],
            canSnag: false,
            canClick: false,
            canMove: false,
            isDragging: false,
            preCircle: null,
            zeropos: [],
            ratio: 0

        };
    }

    componentDidMount() {
        this.setDeviceList();
        let canvas = document.getElementById('canvas')
        canvas.onmousedown = this.canvasClick
        canvas.onmouseup = this.stopDragging
        canvas.onmouseout = this.stopDragging
        canvas.onmousemove = this.dragCircle
    }
    //连接相机
    connectDevice = (deviceId) => {
        //先关闭当前正在运行摄像头
        if (null !== this.state.mediaStream) {
            this.onCloseDevice();
        }
        //打开新选择摄像头
        if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
            //调用用户媒体设备, 访问摄像头
            this.getUserMedia({ video: { width: 3264, height: 2448, deviceId: { exact: deviceId } } }, this.success, this.error);
        } else {
            Alert.info('不支持访问用户媒体');
        }
    };
    //获取设备列表并设置到设备列表
    setDeviceList = async () => {
        let deviceArray = await navigator.mediaDevices.enumerateDevices();
        if (deviceArray.length > 0) {
            let mediaDeviceList = [];
            for (let i in deviceArray) {
                if (deviceArray[i].kind === 'videoinput') {
                    let obj = {
                        "value": deviceArray[i].deviceId,
                        "label": deviceArray[i].label
                    };
                    mediaDeviceList.push(obj);
                }
            }
            //判断是否有可用的视频输入设备
            if (mediaDeviceList.length > 0) {
                this.setState({
                    mediaDeviceList,
                    defalutSelectedDevice: mediaDeviceList[0].value,
                    deviceId: mediaDeviceList[0].value
                });
                this.connectDevice();
            } else {
                this.setState({
                    tips: "没有可用照片采集设备或者浏览器不支持此功能，请保证设备可正常使用(此方式不支持IE浏览器)"
                });
            }
        } else {
            Alert.info("没有可用设备或设备不可用！");
        }
    };
    //访问用户媒体设备的兼容方法
    getUserMedia = (constraints, success, error) => {
        if (navigator.mediaDevices.getUserMedia) {
            //最新的标准API
            navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);
        } else if (navigator.webkitGetUserMedia) {
            //webkit核心浏览器
            navigator.webkitGetUserMedia(constraints, success, error)
        } else if (navigator.mozGetUserMedia) {
            //firfox浏览器
            navigator.mozGetUserMedia(constraints, success, error);
        } else if (navigator.getUserMedia) {
            //旧版API
            navigator.getUserMedia(constraints, success, error);
        }
    };
    //成功回调
    success = (stream) => {
        let video = document.getElementById('video');

        //兼容webkit核心浏览器
        // let CompatibleURL = window.URL || window.webkitURL;
        //将视频流设置为video元素的源
        this.setState({ mediaStream: stream, deviceActive: true });
        //video.src = CompatibleURL.createObjectURL(stream);
        video.srcObject = stream;
        video.play();

    };
    //失败回调
    error = (error) => {
        console.log(`访问用户媒体设备失败${error.name}, ${error.message}`);
    };
    takePictureSave = () => {
        // 从视频流中提取照片，创建一个隐藏的canvas，尺寸和视频流原始尺寸一样（3264，2448）
        let video = document.getElementById('video');
        let canvas = document.createElement('canvas')
        let context = canvas.getContext('2d')
        canvas.width = 3264
        canvas.height = 2448
        let angle = -180 * Math.PI / 180
        context.rotate(angle)
        context.translate(-canvas.width, -canvas.height)
        context.drawImage(video, 0, 0)

        let dataURL = canvas.toDataURL()
        console.log('照片数据是', dataURL)
    }
    //拍照预览
    takePicturePreView = () => {
        console.log('拍照预览')
        let video = document.getElementById('video');
        let canvas = document.getElementById('canvas');
        let context = canvas.getContext('2d');
        context.drawImage(video,  0, 0, 3264, 2448, 0, 60, 480, 360);

        // 绘图转背景，不会被抹掉
        let backgroundImg = 'url(' + canvas.toDataURL() + ')'
        context.clearRect(0, 0, canvas.width, canvas.height)
        // $("#canvas").css('background-image', backgroundImg);
        canvas.style.background = backgroundImg;
    };
    snag = () => {
        this.takePicturePreView()
        this.takePictureSave()
    }
    //关闭摄像头
    onCloseDevice = () => {
        //关闭
        let stream = this.state.mediaStream;
        if (stream === null) {
            return;
        }
        if (stream.active === true) {
            let track = stream.getTracks()[0];
            track.stop();
            this.setState({ deviceActive: false });
        }
    };
    //打开设备
    openDevice = () => {
        if (this.state.deviceId !== "") {
            this.connectDevice();
        } else {
            Alert.info("当前设备不可用,请选择设备！");
        }
    };
    //验证canvas画布是否为空函数
    isCanvasBlank = (canvas) => {
        var blank = document.createElement('canvas');//系统获取一个空canvas对象
        blank.width = canvas.width;
        blank.height = canvas.height;
        return canvas.toDataURL() === blank.toDataURL();//比较值相等则为空
    };
    render() {

        // const radioStyle = {
        //     display: 'block',
        //     height: '30px',
        //     lineHeight: '30px',
        // };

        return (<div>{this.state.tips === "" ? <div style={{ backgroundColor: "#FFF", padding: '20px' }}>
            <Row>
                <Col span={10} key={1}>
                    <h3>实时画面:</h3>
                    <div className="camera-div">
                        <video id="video" width="480" height="480" className="camera-video">
                    </video>
                    </div>
                    <Row style={{ marginTop: "36px" }}>
                        <div>
                            设备列表 : <Select style={{ width: '180px' }}
                                value={this.state.defalutSelectedDevice}
                                onChange={(value) => {
                                    this.setState({
                                        defalutSelectedDevice: value,
                                    });
                                    this.connectDevice(value);
                                }}
                                notFoundContent="没有可用的设备"
                            >
                                {this.state.mediaDeviceList.length > 0 ? this.state.mediaDeviceList.map((item, index) => {
                                    return (<Option key={index} value={item.value}>{item.label}</Option>);
                                }) : null}
                            </Select>
                            <Button type="primary" disabled={this.state.deviceActive} style={{ marginLeft: '20px' }}
                                onClick={() => {
                                    this.openDevice();
                                }}>打开设备</Button>
                            <Button type="primary" disabled={!this.state.deviceActive} style={{ marginLeft: '20px' }}
                                onClick={() => {
                                    this.onCloseDevice();
                                }}>关闭设备</Button>
                        </div>
                    </Row>
                </Col>
                <Col span={10} key={2}>
                    <div>
                        <h3>预览:</h3>
                        <canvas id="canvas" width="480" height="480" className="camera-canvas"></canvas>
                    </div>
                </Col>
                <Col span={4} key={3}>
                    <div>
                        <button onClick={this.snag}>截图</button>
                    </div>
                </Col>
            </Row>
        </div> : <Result status="warning" title={this.state.tips}
            extra={<Button type="danger" style={{ float: "right", marginLeft: '36px' }} onClick={() => {
                //关闭窗口
                if (typeof (this.props.onClose) !== 'undefined') {
                    this.props.onClose();
                }
            }}>关闭</Button>} />}</div>);
    }
}