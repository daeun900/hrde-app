import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, Alert, BackHandler,Platform } from 'react-native';
import { Checkbox } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useLogoutHandler from '../hooks/LogoutHandler';
import styled from 'styled-components/native';
import { useDomain } from "../context/domaincontext";
import { Linking } from 'react-native';
import axios from 'axios';

export default function AgreementScreen({navigation, route}) {
    const insets = useSafeAreaInsets(); //아이폰 노치 문제 해결
    const { domain } = useDomain();
    const { id } = route.params; 

  //뒤로가기 시 로그아웃
  useLogoutHandler(navigation, domain);

  //체크박스
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [isTermChecked, setIsTermChecked] = useState(false);
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);
  const [isPrivacy2Checked, setIsPrivacy2Checked] = useState(false);
  const [isSendingChecked, setIsSendingChecked] = useState(false);
  const [isMarketingChecked, setIsMarketingChecked] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isPhoneChecked, setIsPhoneChecked] = useState(false);

  const handleCheck = (type) => {
    // 개별 체크박스 상태 업데이트
    const updatedStates = {
      term: type === 'term' ? !isTermChecked : isTermChecked,
      privacy: type === 'privacy' ? !isPrivacyChecked : isPrivacyChecked,
      privacy2: type === 'privacy2' ? !isPrivacy2Checked : isPrivacy2Checked,
      sending: type === 'sending' ? !isSendingChecked : isSendingChecked,
      marketing: type === 'marketing' ? !isMarketingChecked : isMarketingChecked,
      email: type === 'email' ? !isEmailChecked : isEmailChecked,
      phone: type === 'phone' ? !isPhoneChecked : isPhoneChecked,
    };
  
    if (type === 'all') {
      const newState = !isAllChecked;
      setIsAllChecked(newState);
      setIsTermChecked(newState);
      setIsPrivacyChecked(newState);
      setIsPrivacy2Checked(newState);
      setIsSendingChecked(newState);
      setIsMarketingChecked(newState);
      setIsEmailChecked(newState);
      setIsPhoneChecked(newState);
    } else {
      if (type === 'term') setIsTermChecked(updatedStates.term);
      if (type === 'privacy') setIsPrivacyChecked(updatedStates.privacy);
      if (type === 'privacy2') setIsPrivacy2Checked(updatedStates.privacy2);
      if (type === 'sending') setIsSendingChecked(updatedStates.sending);

   
      if (type === 'marketing') {
        const newMarketingState = !isMarketingChecked;
        setIsMarketingChecked(newMarketingState);
        setIsEmailChecked(newMarketingState);
        setIsPhoneChecked(newMarketingState);
      }

      if (type === 'email' || type === 'phone') {
        setIsEmailChecked(type === 'email' ? updatedStates.email : isEmailChecked);
        setIsPhoneChecked(type === 'phone' ? updatedStates.phone : isPhoneChecked);
        setIsMarketingChecked(updatedStates.email || updatedStates.phone);
      }

      setIsAllChecked(
        updatedStates.term &&
        updatedStates.privacy &&
        updatedStates.privacy2 &&
        updatedStates.sending &&
        updatedStates.marketing &&
        (updatedStates.email || updatedStates.phone)
      );
    }
  };
  

  //약관 내용 표시
  const [isTermVisible, setIsTermVisible] = useState(false); 
  const [isPrivacyVisible, setIsPrivacyVisible] = useState(false);
  const [isPrivacy2Visible, setIsPrivacy2Visible] = useState(false);
  const [isSendingVisible, setIsSendingVisible] = useState(false);
  const [isMarketingVisible, setIsMarketingVisible] = useState(false);

  const toggleVisibility = (type) => {
    if (type === 'term') {
      setIsTermVisible((prev) => !prev);
    } else if (type === 'privacy') {
      setIsPrivacyVisible((prev) => !prev);
    } else if (type === 'privacy2') {
      setIsPrivacy2Visible((prev) => !prev);
    } else if (type === 'sending') {
      setIsSendingVisible((prev) => !prev);
    } else if (type === 'marketing') {
      setIsMarketingVisible((prev) => !prev);
    }
  };

  //동의 제출
  const handleAgree = async () => {
    if (!isTermChecked || !isPrivacyChecked || !isPrivacy2Checked) {
      Alert.alert('필수 동의사항을 확인해주세요');
      return;
    }

    const requestData = {
      Agree01: isTermChecked ? 'on' : 'off',
      Agree02: isPrivacyChecked ? 'on' : 'off',
      Agree03: isPrivacy2Checked ? 'on' : 'off',
      Mailling: isSendingChecked ? 'on' : 'off',
      Marketing: isMarketingChecked ? 'on' : 'off',
      chk4Email: isEmailChecked ? 'on' : 'off',
      chk4Sms: isPhoneChecked ? 'on' : 'off',
      id: id,
    };

    try {
      // axios로 서버 요청
      const response = await axios.post(`${domain}/mobile/after_join_term.php`, requestData);
      const result = response.data.result; // 서버 응답 결과

      // 응답 처리
      if (result === 'P') {
        Alert.alert('동의가 완료되었습니다.', '', [
          { text: '확인', onPress: () => navigation.replace('ChangePwd', { id }) },
        ]);
      } else if (result === 'E1') {
        Alert.alert('필수 동의사항을 모두 확인해주세요.');
      } else {
        Alert.alert('처리 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('서버 요청 오류:', err);
      Alert.alert('서버와 연결하는 중 문제가 발생했습니다. 네트워크 상태를 확인해주세요.');
    }
  };

  return (
    <Container insets={insets} style={{flex:1, paddingTop: insets.top, backgroundColor:'#fff'}}>
      <LogoImg source={{uri: `${domain}/common/img/logo.png`}}   resizeMode="contain" />
      <Title>동의 항목</Title>
      <CheckboxContainer style={{borderBottomColor:'#333', borderBottomWidth:1, paddingBottom:10}}>
        <Checkbox.Android
          status={isAllChecked ? 'checked' : 'unchecked'}
          onPress={() => handleCheck('all')}
          color="#008DF3"
        />
        <CheckboxLabel style={{fontWeight:'bold'}}>모두 동의(선택 정보 포함)</CheckboxLabel>
      </CheckboxContainer>
      <AgreeContainer>
        <ToggleContainer>
          <CheckboxContainer>
              <Checkbox.Android
                status={isTermChecked ? 'checked' : 'unchecked'}
                onPress={() => handleCheck('term')}
                color="#008DF3"
              />
            <CheckboxLabel>
              이용 약관 동의 (필수)
            </CheckboxLabel>
          </CheckboxContainer>
          <Icon
            name={isTermVisible ? 'chevron-down' : 'chevron-up'} // 아이콘으로 변경
            size={24}
            color="#333"
            onPress={() => toggleVisibility('term')}
          />
        </ToggleContainer>
        {isTermVisible && (
          <TermContent>
            <TermText 
            onPress={() => Linking.openURL(`${domain}/public/etc/agreement.html`)}>
              이용 약관 바로가기
              <Icon
                name={'chevron-right'} 
                size={12}
              />
              </TermText>
          </TermContent>
        )}
      </AgreeContainer>
      <AgreeContainer>
        <ToggleContainer>
          <CheckboxContainer>
            <Checkbox.Android
             status={isPrivacyChecked ? 'checked' : 'unchecked'}
             onPress={() => handleCheck('privacy')}
             color="#008DF3"
            />
            <CheckboxLabel>
              개인정보 수집 및 이용 동의 (필수)
            </CheckboxLabel>
          </CheckboxContainer>
          <Icon
            name={isPrivacyVisible ? 'chevron-down' : 'chevron-up'} // 아이콘으로 변경
            size={24}
            color="#333"
            onPress={() => toggleVisibility('privacy')}
          />
        </ToggleContainer>
        {isPrivacyVisible && (
          <TermContent>
            <TermText 
              onPress={() => Linking.openURL(`${domain}/public/etc/privacy.html`)}>
                개인정보 처리방침 바로가기
                <Icon
                  name={'chevron-right'} 
                  size={12}
                />
              </TermText>
            </TermContent>
        )}
      </AgreeContainer>
      <AgreeContainer>
        <ToggleContainer>
          <CheckboxContainer>
            <Checkbox.Android
             status={isPrivacy2Checked ? 'checked' : 'unchecked'}
             onPress={() => handleCheck('privacy2')}
             color="#008DF3"
            />
            <CheckboxLabel>
              개인정보 제3자 제공 동의 (필수)
            </CheckboxLabel>
          </CheckboxContainer>
          <Icon
            name={isPrivacy2Visible ? 'chevron-down' : 'chevron-up'} // 아이콘으로 변경
            size={24}
            color="#333"
            onPress={() => toggleVisibility('privacy2')}
          />
        </ToggleContainer>
        {isPrivacy2Visible && (
          <TermContent>
             <TableContainer>
                <TableRow header>
                  <TableCell header>구분</TableCell>
                  <TableCell header>개인정보를 제공받는 자</TableCell>
                  <TableCell header>제공하는 개인정보의 항목</TableCell>
                  <TableCell header>개인정보 이용목적</TableCell>
                  <TableCell header>개인정보 이용기간 및 보유기간</TableCell>
                </TableRow>
                  <TableRow>
                    <TableCell>직업능력개발훈련 모니터링에 관한 규정</TableCell>
                    <TableCell>한국산업인력공단, 고용노동부</TableCell>
                    <TableCell>성명, 주민등록번호, 회사, 연락처, 이메일, 수강정보</TableCell>
                    <TableCell>고용보험 환급 수강생 모니터링, 문자발송 등</TableCell>
                    <TableCell>수집 후 3년</TableCell>
                  </TableRow>
              </TableContainer>
              <TermText style={{paddingBottom:20}}>
              ※귀하께서는 개인정보 제공 및 활용에 거부할 권리가 있습니다.
              거부에 따른 불이익 : 위 제공사항은 한국산업인력공단 모니터링 등에 반드시 필요한 사항으로 거부하실 경우 한국산업인력공단 모니터링, 수강, 증명서 발급이 불가능함을 알려드립니다.
              </TermText>
          </TermContent>
        )}
      </AgreeContainer>
      <AgreeContainer>
        <ToggleContainer>
          <CheckboxContainer>
            <Checkbox.Android
               status={isSendingChecked ? 'checked' : 'unchecked'}
               onPress={() => handleCheck('sending')}
               color="#008DF3"
            />
            <CheckboxLabel>
              수강확인 SMS/알림톡/메일발송 동의
            </CheckboxLabel>
          </CheckboxContainer>
          <Icon
            name={isSendingVisible ? 'chevron-down' : 'chevron-up'} // 아이콘으로 변경
            size={24}
            color="#333"
            onPress={() => toggleVisibility('sending')}
          />
        </ToggleContainer>
        <Text style={{color:'red', fontSize: 13}}>   *비동의 시 수강진도나 수료에 관한 안내가 되지 않습니다.</Text>
        {isSendingVisible && (
          <TermContent>
            <TermText>훈련생에게 SMS/알림톡/메일 등을 발송하여 훈련수강과 관련된 사실관계 확인을 통해 부정수급을 방지하고 설문조사를 진행하여 훈련품질을 향상하기 위한 한국산업인력공단의 모니터링 기능입니다.</TermText>
          </TermContent>
        )}
      </AgreeContainer>
      <AgreeContainer style={{borderBottomColor:'#333'}}>
        <ToggleContainer>
          <CheckboxContainer>
            <Checkbox.Android
               status={isMarketingChecked ? 'checked' : 'unchecked'}
               onPress={() => handleCheck('marketing')}
               color="#008DF3"
            />
            <CheckboxLabel>
              마케팅 정보 수신 동의 (선택)
            </CheckboxLabel>
          </CheckboxContainer>
          <Icon
            name={isMarketingVisible ? 'chevron-down' : 'chevron-up'} // 아이콘으로 변경
            size={24}
            color="#333"
            onPress={() => toggleVisibility('marketing')}
          />
        </ToggleContainer>
        <CheckboxContainer style={{marginLeft:20}}>
          <Checkbox.Android
            status={isEmailChecked ? 'checked' : 'unchecked'}
            onPress={() => handleCheck('email')}
            color="#008DF3"
          />
          <CheckboxLabel>이메일</CheckboxLabel>
          <Checkbox.Android
            status={isPhoneChecked ? 'checked' : 'unchecked'}
            onPress={() => handleCheck('phone')}
            color="#008DF3"
          />
          <CheckboxLabel>SMS</CheckboxLabel>
        </CheckboxContainer>
        {isMarketingVisible && (
          <TermContent>
            <TermText>교육원 내 홍보 등 광고성 정보의 수신에 동의합니다. (단, 교육과 관련된 필수 과정 정보, 주요 공지사항, 안내 등은 수신 동의 여부에 관계없이 자동 발송됩니다.) </TermText>
          </TermContent>
        )}
      </AgreeContainer>
      <AgreeButton
        onPress={handleAgree}
        disabled={!isTermChecked || !isPrivacyChecked|| !isPrivacy2Checked}
        isActive={isTermChecked && isPrivacyChecked && isPrivacy2Checked}
      >
        <ButtonText>동의하고 진행하기</ButtonText>
      </AgreeButton>
    </Container>
  );
}

const Container = styled.ScrollView.attrs({
  nestedScrollEnabled: true, // 중첩 스크롤 활성화
})`
  flex: 1;
  padding: 20px;
  background-color: #fff;
`;

const LogoImg = styled.Image`
width: 190px;
height: 35px;
margin: 50px auto 10px auto;
` 
 
const Title = styled.Text`
  font-size: 34px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
`;

const AgreeContainer = styled.View`
  border-bottom-width: 1px;
  border-bottom-color: #ccc;
  padding: 5px 0;
`

const ToggleContainer = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`
const CheckboxContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const CheckboxLabel = styled.Text`
  font-size: 15px;
`;

const ToggleText = styled.Text`
  font-size: 12px;
  margin-left: 5px;
`;

const TermContent = styled.ScrollView.attrs({
  nestedScrollEnabled: true, // 내부 스크롤뷰에서도 스크롤 가능
})`
  max-height: 200px;
  padding:10px 10px;
  background-color: #eee;
  border-radius: 5px;
  margin: 5px 0 10px 0;
`;
const TermText= styled.Text`
  font-size: 13px;
  line-height: 16px;
`

const AgreeButton = styled(TouchableOpacity)`
  margin-top: 30px;
  padding: 15px;
  border-radius: 5px;
  align-items: center;
  background-color: ${({ isActive }) => (isActive ? '#008DF3' : '#ccc')};
`;

const ButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;

const TableContainer = styled.View`
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
  margin: 10px;
`;

const TableRow = styled.View`
  flex-direction: row;
  background-color: ${({ header }) => (header ? '#f1f1f1' : '#fff')};
  border-bottom-width: ${({ header }) => (header ? '2px' : '1px')};
  border-bottom-color: #ccc;
`;

const TableCell = styled.Text`
  flex: 1;
  padding: 10px;
  font-size: 10px;
  text-align: center;
  font-weight: ${({ header }) => (header ? 'bold' : 'normal')};
  color: ${({ header }) => (header ? '#333' : '#000')};
`;