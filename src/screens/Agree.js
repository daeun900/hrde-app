import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Checkbox } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from 'styled-components/native';
import { useDomain } from "../context/domaincontext";

export default function AgreementScreen({navigation}) {
    const insets = useSafeAreaInsets(); //아이폰 노치 문제 해결
    const { domain } = useDomain();

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
  const [isTermVisible, setIsTermVisible] = useState(true); 
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
  const handleAgree = () => {
    if (!isTermChecked || !isPrivacyChecked) {
      Alert.alert('필수 동의사항을 확인해주세요');
      return;
    }
    navigation.navigate("ChangePwd");
  };

  return (
    <Container insets={insets}>
      <LogoImg source={{uri: `${domain}/common/img/logo.png`}}   resizeMode="contain" />
      <Title>동의 항목</Title>
      <CheckboxContainer style={{borderBottomColor:'#333', borderBottomWidth:1, paddingBottom:10}}>
        <Checkbox
          status={isAllChecked ? 'checked' : 'unchecked'}
          onPress={() => handleCheck('all')}
          color="#008DF3"
        />
        <CheckboxLabel style={{fontWeight:'bold'}}>모두 동의(선택 정보 포함)</CheckboxLabel>
      </CheckboxContainer>
      <AgreeContainer>
        <ToggleContainer>
          <CheckboxContainer>
            <Checkbox
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
            <Text>이용 약관 내용이 여기에 들어갑니다. 내용을 확인해 주세요.</Text>
          </TermContent>
        )}
      </AgreeContainer>
      <AgreeContainer>
        <ToggleContainer>
          <CheckboxContainer>
            <Checkbox
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
            <Text>이용 약관 내용이 여기에 들어갑니다. 내용을 확인해 주세요.</Text>
          </TermContent>
        )}
      </AgreeContainer>
      <AgreeContainer>
        <ToggleContainer>
          <CheckboxContainer>
            <Checkbox
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
            <Text>이용 약관 내용이 여기에 들어갑니다. 내용을 확인해 주세요.</Text>
          </TermContent>
        )}
      </AgreeContainer>
      <AgreeContainer>
        <ToggleContainer>
          <CheckboxContainer>
            <Checkbox
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
            <Text>이용 약관 내용이 여기에 들어갑니다. 내용을 확인해 주세요.</Text>
          </TermContent>
        )}
      </AgreeContainer>
      <AgreeContainer style={{borderBottomColor:'#333'}}>
        <ToggleContainer>
          <CheckboxContainer>
            <Checkbox
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
          <Checkbox
            status={isEmailChecked ? 'checked' : 'unchecked'}
            onPress={() => handleCheck('email')}
            color="#008DF3"
          />
          <CheckboxLabel>이메일</CheckboxLabel>
          <Checkbox
            status={isPhoneChecked ? 'checked' : 'unchecked'}
            onPress={() => handleCheck('phone')}
            color="#008DF3"
          />
          <CheckboxLabel>SMS</CheckboxLabel>
        </CheckboxContainer>
        {isMarketingVisible && (
          <TermContent>
            <Text>이용 약관 내용이 여기에 들어갑니다. 내용을 확인해 주세요.</Text>
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

const Container = styled.View`
  flex: 1;
  padding: 20px;
  background-color: #fff;
`;

const LogoImg = styled.Image`
width: 190px;
height: 35px;
margin: 50px auto 5px auto;
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
  font-size: 14px;
`;

const ToggleText = styled.Text`
  font-size: 12px;
  margin-left: 5px;
`;

const TermContent = styled.View`
  padding: 10px;
  background-color: #eee;
  border-radius: 5px;
  margin: 5px 0 10px 0;
`;

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
