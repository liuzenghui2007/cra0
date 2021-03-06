import React, { setState, useRef } from "react";
import { Form, Input, Button, Row, Col, Select, message, Result } from "antd";
import Alert from "../common/Alert";
import "./index.css";
import feathersClient from "../../utils/app";
// const { confirm } = Modal;

const { Option } = Select;

//调用高拍仪使用webapi
export class CameraItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      defalutSelectedDevice: "",
      mediaDeviceList: [],
      deviceId: "",
      mediaStream: null,
      deviceActive: false,
      tips: "",
      picsObj: {},
    };
  }

  componentDidMount() {
    this.setDeviceList();
    let canvas = document.getElementById("canvas");
    canvas.onmousedown = this.canvasClick;
    canvas.onmouseup = this.stopDragging;
    canvas.onmouseout = this.stopDragging;
    canvas.onmousemove = this.dragCircle;
    this.initPicsObj();
  }
  // 初始化照片空对象
  initPicsObj = () => {
    this.setState({
      picsObj: {
        face: "",
        top: "",
        bottom: "",
      },
    });
  };
  // 上传照片对象
  uploadPicsObj = () => {
    console.log(this.state.picsObj);
    feathersClient.services.pics
      .create({
        text: "this is a pic",
        ...this.state.picsObj,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  //连接相机
  connectDevice = (deviceId) => {
    //先关闭当前正在运行摄像头
    if (null !== this.state.mediaStream) {
      this.onCloseDevice();
    }
    //打开新选择摄像头
    if (
      navigator.mediaDevices.getUserMedia ||
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia
    ) {
      //调用用户媒体设备, 访问摄像头
      this.getUserMedia(
        { video: { width: 3264, height: 2448, deviceId: { exact: deviceId } } },
        this.success,
        this.error
      );
    } else {
      Alert.info("不支持访问用户媒体");
    }
  };
  //获取设备列表并设置到设备列表
  setDeviceList = async () => {
    let deviceArray = await navigator.mediaDevices.enumerateDevices();
    if (deviceArray.length > 0) {
      let mediaDeviceList = [];
      for (let i in deviceArray) {
        if (deviceArray[i].kind === "videoinput") {
          let obj = {
            value: deviceArray[i].deviceId,
            label: deviceArray[i].label,
          };
          mediaDeviceList.push(obj);
        }
      }
      //判断是否有可用的视频输入设备
      if (mediaDeviceList.length > 0) {
        this.setState({
          mediaDeviceList,
          defalutSelectedDevice: mediaDeviceList[0].value,
          deviceId: mediaDeviceList[0].value,
        });
        this.connectDevice();
      } else {
        this.setState({
          tips: "没有可用照片采集设备或者浏览器不支持此功能，请保证设备可正常使用(此方式不支持IE浏览器)",
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
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(success)
        .catch(error);
    } else if (navigator.webkitGetUserMedia) {
      //webkit核心浏览器
      navigator.webkitGetUserMedia(constraints, success, error);
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
    let video = document.getElementById("video");

    //兼容webkit核心浏览器
    // let CompatibleURL = window.URL || window.webkitURL;
    //将视频流设置为video元素的源
    this.setState({ mediaStream: stream, deviceActive: true });
    //video.src = CompatibleURL.createObjectURL(stream);
    video.srcObject = stream;
    video.play();
    // 视频流读取成功即可绘制舌mask
    this.drawMask();
  };
  //失败回调
  error = (error) => {
    console.log(`访问用户媒体设备失败${error.name}, ${error.message}`);
  };
  // 动态修改一个属性值
  handleSetState = (cat, key, val) => {
    const category = { ...this.state[cat] };
    category[key] = val;
    this.setState({ [cat]: category });
  };
  takePictureSave = (pos) => {
    // 从视频流中提取照片，创建一个隐藏的canvas，尺寸和视频流原始尺寸一样（3264，2448）
    let video = document.getElementById("video");
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    let dataURL;
    if (pos === "face") {
      canvas.width = 3264;
      canvas.height = 2448;
      let angle = (-180 * Math.PI) / 180;
      context.rotate(angle);
      context.translate(-canvas.width, -canvas.height);
      context.drawImage(video, 0, 0);
      dataURL = canvas.toDataURL();
    } else {
      canvas.width = 1200;
      canvas.height = 900;
      let w = 900;
      let h = 1200;
      let ydist;
      ydist = pos === "top" ? 400 : 700;
      context.drawImage(video, ydist, (2448 - w) / 2, h, w, 0, 0, 1200, 900);

      dataURL = canvas.toDataURL();
    }
    // console.log(pos, dataURL)
    // 修改state的某个属性，如果连属性名都是动态的呢
    // https://medium.com/@katestamas/dynamically-update-states-in-react-7558287e5fb9
    // state的改变是异步的
    this.handleSetState("picsObj", pos, dataURL);
    // console.log(this.state.picsObj)
  };
  //拍照预览
  takePicturePreView = (pos) => {
    console.log("拍照预览");
    let video = document.getElementById("video");
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");

    if (pos === "face")
      context.drawImage(video, 0, 0, 3264, 2448, 0, 60, 480, 360);
    else if (pos === "top") {
      let w = 900;
      let h = 1200;
      context.drawImage(video, 400, (2448 - w) / 2, h, w, 0, 60, 480, 360);
    } else if (pos === "bottom") {
      let w = 900;
      let h = 1200;
      context.drawImage(video, 400, (2448 - w) / 2, h, w, 0, 60, 480, 360);
    }
    // 绘图转背景，不会被抹掉
    let dataURL = canvas.toDataURL();
    let backgroundImg = "url(" + dataURL + ")";
    context.clearRect(0, 0, canvas.width, canvas.height);
    // $("#canvas").css('background-image', backgroundImg);
    canvas.style.background = backgroundImg;
  };
  snag = (pos) => {
    this.takePicturePreView(pos);
    this.takePictureSave(pos);
  };
  drawMask = () => {
    // 拍摄舌面时，在video组件上面叠加一层带舌外框的透明的canvas
    // 目前是一直显示在video上面
    const canvas = document.getElementById("mask");
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 3;
    ctx.beginPath();
    let w = 100,
      h = 160;
    let p0 = {},
      p1 = {},
      p2 = {},
      p3 = {};
    p0.x = 240;
    p0.y = 400;

    // # 三次贝塞尔
    let p0z = {},
      p0y = {},
      dpx = 50,
      dpy = -20;
    p0z.x = p0.x - dpx;
    p0z.y = p0.y + dpy;
    p0y.x = p0.x + dpx;
    p0y.y = p0.y + dpy;
    // # 三次结束

    p1.x = p0.x - w / 2;
    p1.y = p0.y - h;
    p2.x = p0.x + w / 2;
    p2.y = p0.y - h;

    p3.x = 240;
    p3.y = p0.y - 180;
    ctx.moveTo(p1.x, p1.y);
    // # 舌头下边缘是二次贝塞尔曲线，类似抛物线
    // # 开始点 控制点 结束点
    // # ctx.quadraticCurveTo(p0.x, p0.y, p2.x, p2.y);
    // # 三次贝塞尔，舌头
    ctx.bezierCurveTo(p0z.x, p0z.y, p0y.x, p0y.y, p2.x, p2.y);
    ctx.quadraticCurveTo(p3.x, p3.y, p1.x, p1.y);
    // # 舌头右上-三次贝塞尔曲线
    // # 开始点，控制点1，控制点2，结束点
    // # ctx.bezierCurveTo(414,218,340,192,300,200);
    // # ctx.bezierCurveTo(260,192,186,218,164, 218);
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.strokeStyle = "rgb(255,0,0)";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  };
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
    var blank = document.createElement("canvas"); //系统获取一个空canvas对象
    blank.width = canvas.width;
    blank.height = canvas.height;
    return canvas.toDataURL() === blank.toDataURL(); //比较值相等则为空
  };
  onFinish = (values) => {
    console.log("Success:", values);
    this.setState({
      picsObj: {
        face: "",
        top: "",
        bottom: "",
        ...values,
      },
    });
  };

  onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  render() {
    // const radioStyle = {
    //     display: 'block',
    //     height: '30px',
    //     lineHeight: '30px',
    // };

    return (
      <div>
        {this.state.tips === "" ? (
          <div style={{ backgroundColor: "#FFF", padding: "20px" }}>
            <Row>
              <Col span={10} key={1}>
                <h3>实时:</h3>
                <div className="camera-div">
                  <video
                    id="video"
                    width="480"
                    height="480"
                    className="camera-video"
                  />
                  <canvas
                    id="mask"
                    width="480"
                    height="480"
                    className="camera-mask"
                  />
                </div>
                <Row style={{ marginTop: "36px" }}>
                  <div>
                    设备列表 :{" "}
                    <Select
                      style={{ width: "180px" }}
                      value={this.state.defalutSelectedDevice}
                      onChange={(value) => {
                        this.setState({
                          defalutSelectedDevice: value,
                        });
                        this.connectDevice(value);
                      }}
                      notFoundContent="没有可用的设备"
                    >
                      {this.state.mediaDeviceList.length > 0
                        ? this.state.mediaDeviceList.map((item, index) => {
                            return (
                              <Option key={index} value={item.value}>
                                {item.label}
                              </Option>
                            );
                          })
                        : null}
                    </Select>
                    <Button
                      type="primary"
                      disabled={this.state.deviceActive}
                      style={{ marginLeft: "20px" }}
                      onClick={() => {
                        this.openDevice();
                      }}
                    >
                      打开设备
                    </Button>
                    <Button
                      type="primary"
                      disabled={!this.state.deviceActive}
                      style={{ marginLeft: "20px" }}
                      onClick={() => {
                        this.onCloseDevice();
                      }}
                    >
                      关闭设备
                    </Button>
                  </div>
                </Row>
              </Col>
              <Col span={10} key={2}>
                <div>
                  <h3>捕捉:</h3>
                  <canvas
                    id="canvas"
                    width="480"
                    height="480"
                    className="camera-canvas"
                  ></canvas>
                </div>
              </Col>
            </Row>

            <Row>
              <Col span={20}>
                <Form
                  name="basic"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  initialValues={{ remember: true }}
                  onFinish={this.onFinish}
                  onFinishFailed={this.onFinishFailed}
                  autoComplete="off"
                >
                  <Form.Item
                    label="姓名"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Please input your username!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label="性别"
                    name="sex"
                    rules={[
                      {
                        required: true,
                        message: "Please input your gender!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="年龄"
                    name="age"
                    rules={[
                      {
                        required: true,
                        message: "Please input your age!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="手机"
                    name="mobile"
                    rules={[
                      {
                        required: true,
                        message: "Please input your phone number!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                      开始
                    </Button>
                    <Button
                      type="primary"
                      style={{ marginLeft: "20px" }}
                      onClick={(e) => {
                        this.snag("face", e);
                      }}
                    >
                      面部
                    </Button>
                    <Button
                      type="primary"
                      style={{ marginLeft: "20px" }}
                      onClick={(e) => {
                        this.snag("top", e);
                      }}
                    >
                      舌上
                    </Button>
                    <Button
                      type="primary"
                      style={{ marginLeft: "20px" }}
                      onClick={(e) => {
                        this.snag("bottom", e);
                      }}
                    >
                      舌下
                    </Button>
                    <Button
                      type="primary"
                      style={{ marginLeft: "20px" }}
                      onClick={(e) => {
                        this.uploadPicsObj();
                      }}
                    >
                      上传
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
            <Row></Row>
            <Row>
              <Col span={20} key={3}></Col>
            </Row>
          </div>
        ) : (
          <Result
            status="warning"
            title={this.state.tips}
            extra={
              <Button
                type="danger"
                style={{ float: "right", marginLeft: "36px" }}
                onClick={() => {
                  //关闭窗口
                  if (typeof this.props.onClose !== "undefined") {
                    this.props.onClose();
                  }
                }}
              >
                关闭
              </Button>
            }
          />
        )}
      </div>
    );
  }
}
