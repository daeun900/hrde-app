import React, { useContext, useState, useRef }  from "react";
import styled from "styled-components/native";
import { Text, View, Image, Alert} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute } from '@react-navigation/native';
import axios from 'axios';

const LectureCerti = ({ navigation }) => {
  const insets = useSafeAreaInsets(); //아이폰 노치 문제 해결
  const route = useRoute();
  const {
    Id, LectureCode, StudySeq, ChapterSeq, ContentsIdx, PlayMode, ProgressStep, 
    ContentsName, UserName, UserMobile, SessionId, AgtId, UserIp, LectureTermeIdx, 
    EvalCd, EvalType, ChapterNumberZero, TrnId, ChapterNum  
  } = route.params;
  console.log('Certi 받은 데이터:',route.params)

  const otpRef = useRef(""); // otp 값을 useRef로 관리

  //mOTP 제출
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
                  await axios.post("https://hrdelms.com/mobileTest/player_cert_insert.php", {
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
                  const response = await axios.post("https://hrdelms.com/mobileTest/player_captcha_session.php", {
                    chapterNum: ChapterNum,
                    lectureCode: LectureCode,
                    studySeq: StudySeq,
                    chapterSeq: ChapterSeq
                  });
                
                  alert("인증처리가 완료되었습니다.");
                  console.log('player_captcha_session으로 보낸 데이터: ', ChapterNum, LectureCode, StudySeq, ChapterSeq);
                  console.log(response.data.result); // 서버 응답의 result 필드를 출력
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
  return (
    <View insets={insets} style={{flex:1}}>
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
                <SubmitBtn><MidTxt style={{color:'#fff'}} onPress={handleOtpSubmit}>인증하기</MidTxt></SubmitBtn>
            </InputWrap>
            <SmallTxt>*mOTP외 다른 방법을 원하시는 분은 아래 대체인증을 눌러주세요</SmallTxt>
            <ButtonWrap>
                <CertiBtn><MidTxt>휴대폰 인증</MidTxt></CertiBtn>
                <CertiBtn><MidTxt>아이핀  인증</MidTxt></CertiBtn>
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
    </View>
  );
};


export default LectureCerti;
