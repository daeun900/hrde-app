import React, { useState, useContext, useEffect } from 'react';
import { Alert, Platform, View, BackHandler } from 'react-native';
import styled from 'styled-components/native';
import { useDomain } from "../context/domaincontext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserContext } from "../context/userContext";
import useLogoutHandler from '../hooks/LogoutHandler';
import WebView from 'react-native-webview';
import axios from 'axios';

export default function Step1Auth({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { id } = route.params; 
  const { domain } = useDomain();

  //뒤로가기 시 로그아웃
  useLogoutHandler(navigation, domain);

  //encData받기
  const [encData, setEncData] = useState(null);

  const getEncData = async () => {
    Alert.alert("휴대폰 본인인증", "휴대폰 인증은 본인명의 휴대폰만 인증 가능합니다.");

  try {
    const response = await axios.post(`${domain}/mobile/create_encoded_data.php`, {
      lectureCode: 'PWCHANGE'
    });
    setEncData(response.data.encData);  // 서버에서 암호화된 데이터 받음
    setWebviewVisible(true);  // 인증 시작
  } catch (error) {
    console.error('Error fetching enc data:', error);
  }
};

//휴대폰 본인인증 띄우기
const [webviewVisible, setWebviewVisible] = useState(false);

  const webViewSource = {
    uri: 'https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb',
    method: 'POST',
    body: `m=checkplusService&EncodeData=${encData}`,
  };

  if (Platform.OS === 'ios') {
    webViewSource.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };  // iOS에서만 헤더 추가
  }
  
  //본인검증에 필요한 값
  const { userNm, userMb, userBd, updateUserData} = useContext(UserContext);

  useEffect(() => {
  updateUserData();
  }, []);

  //본인인증 성공
  const handleMobileSubmit = () => {
    navigation.replace("ChangePwd2", { id });
  };

  return (
    <View insets={insets} style={{flex:1, paddingTop: insets.top, backgroundColor:'#fff'}}>
 
    {!webviewVisible ? (
    <>
    <Container insets={insets}>
      <Title>비밀번호 변경</Title>
      <SubTitle>최초 로그인 시, 비밀번호를 변경하여야 합니다.</SubTitle>

      <StepIndicator>
        <StepItem>
          <StepCircle active>
            <StepNumber>1</StepNumber>
          </StepCircle>
          <StepLabel active>본인인증</StepLabel>
        </StepItem>
        <StepLine />
        <StepItem>
          <StepCircle>
            <StepNumber>2</StepNumber>
          </StepCircle>
          <StepLabel>비밀번호 변경</StepLabel>
        </StepItem>
      </StepIndicator>
      <Description>
        비밀번호 변경을 위해 본인인증이 필요합니다. 아래 버튼을 눌러 인증을 진행하세요.
      </Description>

      <AuthButton onPress={getEncData}>
        <AuthButtonText>휴대폰 본인인증</AuthButtonText>
      </AuthButton>
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
         
              setWebviewVisible(false);
              setTimeout(() => {
                Alert.alert('인증 실패');
              }, 300);
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
              setWebviewVisible(false);
              setTimeout(() => {
                Alert.alert('인증 실패', '본인 확인 정보가 다릅니다.');
              }, 300);
            }
          }}
        />
          <CloseButton insets={insets}  onPress={() => setWebviewVisible(false)}>
            <ButtonText>닫기</ButtonText>
          </CloseButton>
       </>
      )}
    </View>
  );
}

const Container = styled.View`
  flex: 1;
  padding: 20px;
  background-color: #fff;
`;

const Title = styled.Text`
  font-size: 30px;
  font-weight: bold;
  margin: 30px 0 10px 0;
`;

const SubTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
`;

const StepIndicator = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 15px 0;
  margin: 15px 0;
  justify-content: center;
  border-bottom-width: 1px;
  border-bottom-color: #ddd;
`;

const StepItem = styled.View`
  align-items: center;
`;

const StepCircle = styled.View`
  width: 30px;
  height: 30px;
  border-radius: 15px;
  background-color: ${({ active }) => (active ? '#007bff' : '#ccc')};
  justify-content: center;
  align-items: center;
`;

const StepNumber = styled.Text`
  color: #fff;
  font-size: 14px;
  font-weight: bold;
`;

const StepLabel = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${({ active }) => (active ? '#007bff' : '#ccc')};
  margin-top: 5px;
`;

const StepLine = styled.View`
  width: 40px;
  height: 2px;
  background-color: #ccc;
  margin: 0 10px;
`;

const Description = styled.Text`
  font-size: 18px;
  color: #606060;
  text-align: center;
  margin: 20px 0;
`;

const AuthButton = styled.TouchableOpacity`
  background-color: #007bff;
  padding: 15px 30px;
  border-radius: 5px;
`;

const AuthButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
`;

const CloseButton = styled.TouchableOpacity`
  position: absolute;
  top: ${({ insets }) => insets.top + 20}px;
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