import React, { useContext, useState, useRef, useEffect, useCallback }  from "react";
import { useFocusEffect } from '@react-navigation/native';
import styled from "styled-components/native";
import { BackHandler, Text, View, Image, Alert, Platform, Linking} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { useDomain } from "../context/domaincontext";
import { parseString } from 'react-native-xml2js';
import { UserContext } from "../context/userContext";
import axios from 'axios';

const LectureCerti = ({ navigation }) => {
  const { domain } = useDomain();

  useEffect(() => {
    // 뒤로 가기 버튼 핸들러 등록
    const backAction = () => {
      navigation.navigate('LectureList')
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); 

  }, []);

  const insets = useSafeAreaInsets(); //아이폰 노치 문제 해결
  const route = useRoute();
  const {
    Id, LectureCode, StudySeq, ChapterSeq, ContentsIdx, PlayMode, ProgressStep, 
    ContentsName, UserName, UserMobile, SessionId, AgtId, UserIp, LectureTermeIdx, 
    EvalCd, EvalType, ChapterNumberZero, TrnId, ChapterNum  
  } = route.params;
  console.log('Certi 받은 데이터:',route.params)


/////////////////////////////////////////////// mOTP 제출 ////////////////////////////////////////////////////////////

  const otpRef = useRef(""); // otp 값을 useRef로 관리

  const handleOtpSubmit = async () => {
    const otp = otpRef.current; // useRef에서 직접 값 가져오기
    console.log(otp)

    if (!otp) {
      Alert.alert("mOTP 인증번호를 입력하세요.");
      return;
    }
  
    const USRDT = new Date().toISOString(); // 현재 시간 사용
    const CLASS_AGENT_PK = `${LectureCode},${LectureTermeIdx}`;
    try {
      const response = await axios.post("https://emonotp.hrdkorea.or.kr/api/v2/otp_accredit", 
        new URLSearchParams({
          USER_NM: UserName,
          USER_TEL: UserMobile,
          OTPNO: otp,
          AGTID: AgtId,
          USRID: Id,
          SESSIONID: SessionId, 
          EXIP: UserIp, 
          COURSE_AGENT_PK: LectureCode,
          CLASS_AGENT_PK,
          EVAL_CD: EvalCd,
          EVAL_TYPE: EvalType,
          CLASS_TME: EvalCd === '00' ? '00' : ChapterNumberZero,
          USRDT,
          UT: USRDT,
        }), {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          }
        });
  
      const data = response.data;
  
      if (data.status === "SUCCESS") {
              //입과 본인인증 시
              if (EvalCd  == '00') {
                try {
                  await axios.post(`${domain}/mobile/player_cert_insert.php`, {
                    id: Id,
                    lectureCode: LectureCode,
                    studySeq: StudySeq,
                    certType: 'user',
                    AGTID: AgtId,
                    COURSE_AGENT_PK: LectureCode,
                    CLASS_AGENT_PK,
                    m_Ret: 'T',
                    m_retCD: '000000',
                    m_trnID: TrnId,
                    m_trnDT: USRDT
                  });

                  alert("입과시 mOTP 인증처리가 완료되었습니다.\n 한번 더 mOTP인증처리가 필요합니다.");

                } catch (error) {
                  console.error("인증 처리 중 오류 발생:", error);
                  alert("인증 처리 중 오류가 발생하였습니다.");
                }
              }

            //입과 외 인증 시 
              else{
                try {
                  const response = await axios.post(`${domain}/mobile/player_captcha_session.php`, {
                    chapterNum: ChapterNum,
                    lectureCode: LectureCode,
                    studySeq: StudySeq,
                    chapterSeq: ChapterSeq
                  });
                
                  alert("인증처리가 완료되었습니다.");
                  //console.log('player_captcha_session으로 보낸 데이터: ', ChapterNum, LectureCode, StudySeq, ChapterSeq);
                  //console.log(response.data.result); 
                } catch (error) {
                  console.error("인증 처리 중 오류 발생:", error);
                  alert("인증 처리 중 오류가 발생하였습니다.");
                }
              }

              navigation.navigate("LecturePlayer", {      
                LectureCode: LectureCode, 
                StudySeq: StudySeq, 
                ChapterSeq: ChapterSeq, 
                ContentsIdx: ContentsIdx, 
                // ProgressIdx: returnData[4], 
                PlayMode: PlayMode, 
                ProgressStep: ProgressStep 
              });

      } else if (data.code === "AP001") {
        Alert.alert("인증 오류", "인증번호가 일치하지 않습니다. 다시 입력 하세요.");
    
      } else if (data.code === "AP009") {
        Alert.alert("인증 오류", "5회 오류가 발생하였습니다. mOTP인증이 잠겼습니다. 휴대폰 인증을 시도하세요.");
      } else {
        Alert.alert("시스템 오류", "mOTP시스템 장애가 발생하였습니다. 휴대폰 인증을 시도하세요.");
        console.log("OTP 인증 응답:", data);
      }
    } catch (error) {
      console.error("네트워크 오류:", error);
      if (error.response) {
        // 서버로부터 응답이 왔지만 에러인 경우
        console.log("응답 데이터:", error.response.data);
        console.log("응답 상태 코드:", error.response.status);
        console.log("응답 헤더:", error.response.headers);
      } else if (error.request) {
        // 요청이 이루어졌으나 응답을 받지 못한 경우
        console.log("요청 데이터:", error.request);
      } else {
        // 요청 설정 중에 발생한 문제
        console.log("에러 메시지:", error.message);
      }
      Alert.alert("네트워크 오류", "인증 중 오류가 발생하였습니다. 휴대폰 인증을 시도하세요.");
    }
  };
  
  const [encData, setEncData] = useState(null);
  const [webviewVisible, setWebviewVisible] = useState(false);
 
  /////////////////////////////////////////////////////// 휴대폰 인증 ////////////////////////////////////////////////

  const getEncData = async () => {
      Alert.alert("휴대폰 본인인증", "휴대폰 인증은 본인명의 휴대폰만 인증 가능합니다.");
    try {
      const response = await axios.post(`${domain}/mobile/create_encoded_data.php`, {
        lectureCode: LectureCode
      });
      setEncData(response.data.encData);  // 서버에서 암호화된 데이터 받음
      setWebviewVisible(true);  // 인증 시작
    } catch (error) {
      console.error('Error fetching enc data:', error);
    }
  };

  // XML 파싱을 Promise로 변환
  const parseXml = (xmlData) => {
    return new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };

  //인증성공 시
  const handleMobileSubmit = async () => {
    const USRDT = new Date().toISOString(); // 현재 시간 사용
    const CLASS_AGENT_PK = `${LectureCode},${LectureTermeIdx}`;
  
    try {
      
      alert('인증 성공');

      const response = await axios.post("https://emon.hrdkorea.or.kr/EAIServer/SOURCE/ExConn/LMS/pSubOtpLog.jsp", 
        new URLSearchParams({
        AGTID: AgtId,
        USRID: Id,
        COURSE_AGENT_PK: LectureCode,
        CLASS_AGENT_PK,
        EVAL_CD: EvalCd,
        EVAL_TYPE: EvalType,
        CLASS_TME: EvalCd === '00' ? '00' : ChapterNumberZero,
        m_Ret: 'T',
        m_retCD: '000000',
        m_trnID: TrnId,
        m_trnDT: USRDT
      }), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        }
      });

        const result = await parseXml(response.data);  // parseXml로 XML 파싱
        //console.log(result);  // 전체 파싱 결과 출력
        const retVal = result?.Result?.RetVal?.[0];
        //console.log(retVal)
          if (retVal === "101") {
              //인증성공시
              if (EvalCd === '00') {
               // 입과 본인 인증 시
                try {
                  await axios.post(`${domain}/mobile/player_cert_insert.php`, {
                    id: Id,
                    lectureCode: LectureCode,
                    studySeq: StudySeq,
                    certType: 'user',
                    AGTID: AgtId,
                    COURSE_AGENT_PK: LectureCode,
                    CLASS_AGENT_PK,
                    m_Ret: 'T',
                    m_retCD: '000000',
                    m_trnID: TrnId,
                    m_trnDT: USRDT
                  });
        
                  alert("입과시 인증처리가 완료되었습니다.\n 한번 더 인증처리가 필요합니다.");
        
                } catch (error) {
                  console.error("인증 처리 중 오류 발생:", error);
                  alert("인증 처리 중 오류가 발생하였습니다.");
                }
              } else {
                // 입과 외 인증
                try {
                  await axios.post(`${domain}/mobile/player_captcha_session.php`, {
                    chapterNum: ChapterNum,
                    lectureCode: LectureCode,
                    studySeq: StudySeq,
                    chapterSeq: ChapterSeq
                  });
        
                  alert("인증처리가 완료되었습니다.");
                  console.log('player_captcha_session으로 보낸 데이터: ', ChapterNum, LectureCode, StudySeq, ChapterSeq);
                } catch (error) {
                  console.error("인증 처리 중 오류 발생:", error);
                  alert("인증 처리 중 오류가 발생하였습니다.");
                }
              }
        
              // 인증 성공 후 강의 플레이어 화면으로 이동
              navigation.navigate("LecturePlayer", {
                LectureCode: LectureCode,
                StudySeq: StudySeq,
                ChapterSeq: ChapterSeq,
                ContentsIdx: ContentsIdx,
                PlayMode: PlayMode,
                ProgressStep: ProgressStep
              });
            } else {
              console.error("인증 실패", retVal);
            }
        
          } catch (error) {
            console.error("네트워크 오류:", error);
          }
        };
  

const Title = styled.Text`
    font-weight: 900;
    background-color: #F8F8F8;
    padding: 20px 25px;
    font-size: 16px;
`
const SubTitle = styled.Text`
    padding: 20px 25px;
    background-color: #fff;
    
`
const Container = styled.ScrollView`
  padding: 25px;
  flex-grow: 1;
  background-color: #fff;
  border-top-width:1px;
  border-color:#ededed;
`;

const BigTxt = styled.Text`
  font-size: 20px;
  line-height: 30px;
`
const MidTxt = styled.Text`
  font-size: 16px;
  line-height: 24px;
`
const SmallTxt = styled.Text`
  font-size: 14px;
  line-height: 20px;
  color:#F70101;
`
const InputWrap = styled.View`
    margin-top: 30px;
    margin-bottom: 15px;
    flex-direction: row;
`
const Input = styled.TextInput`
    flex:1;
    padding: 20px 10px;
    border-width: 1px;
    border-color: #b4b4b4;
    border-radius: 6px;
`
const SubmitBtn = styled.TouchableOpacity`
    width: 112px;
    padding: 20px 0;
    background-color: #2194ff;
    border-radius: 6px;
    justify-content: center;
    align-items: center;
    margin-left: 10px;
`
const ButtonWrap = styled.View`
    flex-direction: row;
    gap: 10px;
    margin-top: 15px;
`
const CertiBtn = styled.TouchableOpacity`
    background-color: #ededed;
    border-radius: 6px;
    padding: 15px 0;
    justify-content: center;
    align-items: center;
    flex:1;
`
const ExImg = styled.Image`
    margin: 30px auto;
`

const NumTxtWrap = styled.View`
    padding-left: 20px;
    position: relative;
`
const Num = styled.Text`
    position: absolute;
    top:3px;
    left:0;
    font-size: 16px;
`

const CloseButton = styled.TouchableOpacity`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px;
  border-radius: 5px;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

const webViewSource = {
  uri: 'https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb',
  method: 'POST',
  body: `m=checkplusService&EncodeData=${encData}`,
};


if (Platform.OS === 'ios') {
  webViewSource.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };  // iOS에서만 헤더 추가
}

const { userNm, userMb, userBd, updateUserData} = useContext(UserContext);

useEffect(() => {
  updateUserData();
}, []);

  return (
    
    <View insets={insets} style={{flex:1}}>
        {!webviewVisible ? (
        <>
       <Title>{ ContentsName }</Title>
       <SubTitle>[1차시_어린이집 평가 운영체계]</SubTitle>
       <Container contentContainerStyle={{ paddingBottom: insets.bottom + 30}}>
            <BigTxt style={{fontWeight:'900',textAlign:'center'}}>mOPT 인증</BigTxt>
            <MidTxt style={{marginTop:10,textAlign:'center'}}>mOTP앱에서 조회되는 인증번호를 입력하세요.</MidTxt>
            <InputWrap>
                <Input 
                placeholder="인증번호를 입력하세요"  
                value={otpRef}
                onChangeText={(text) => otpRef.current = text} 
                 maxLength={6}
                 keyboardType={"numeric"}>
                </Input>
                <SubmitBtn onPress={handleOtpSubmit}><MidTxt style={{color:'#fff'}}>인증하기</MidTxt></SubmitBtn>
            </InputWrap>
            <SmallTxt>*mOTP외 다른 방법을 원하시는 분은 아래 대체인증을 눌러주세요</SmallTxt>
            <ButtonWrap>
                <CertiBtn onPress={getEncData}><MidTxt>휴대폰 인증</MidTxt></CertiBtn>
            </ButtonWrap>
            <ExImg source={require('../../assets/mOTP.png')}/>
            <SmallTxt>*위 이미지는 예시용 이미지입니다.</SmallTxt>
            <NumTxtWrap>
                <Num>1.</Num>      
                <MidTxt>휴대폰에 앱이 없으신 분은 스토어나 마켓에서 한국산업인력공단 mOTP를 검색하셔서 먼저 설치하시기 바랍니다.</MidTxt>
            </NumTxtWrap>
            <NumTxtWrap>
                <Num>2.</Num>      
                <MidTxt>mOTP사용이 불가한 경우 다른 방법을 사용하시기 바랍니다.</MidTxt>
            </NumTxtWrap>
       </Container>
       </>
        ) : (
          <>
        <WebView
          key={encData}
          source={webViewSource}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          androidHardwareAccelerationDisabled={true}  
          setSupportMultipleWindows={false}
          originWhitelist={['*']}
          onNavigationStateChange={(event) => {
            console.log('Navigated to URL:', event.url);
            if (event.url.includes('checkplus_success')) {
              console.log('Waiting for PHP response...');
            } else if (event.url.includes('checkplus_fail')) {
              alert('인증 실패');
              setWebviewVisible(false);
            }
          }}
        
          onMessage={(event) => {
            const data = JSON.parse(event.nativeEvent.data);
            console.log('Received data from WebView:', data);

            const { birthDate, mobileNo, name } = data;
          //본인검증
            if ((userMb == mobileNo) && (userNm == name) && (userBd == birthDate)) {
              console.log('본인 인증 성공:', userMb,mobileNo,userNm,name,userBd,birthDate);
              setWebviewVisible(false);
              handleMobileSubmit();
            } else {
              console.log('본인 인증 실패:', userMb,mobileNo,userNm,name,userBd,birthDate);
              alert('인증 실패. 본인 확인 정보가 다릅니다.');
              setWebviewVisible(false);
            }
          }}
        />
          <CloseButton onPress={() => setWebviewVisible(false)}>
            <ButtonText>닫기</ButtonText>
          </CloseButton>
       </>
      )}
    </View>
  );
};


export default LectureCerti;
