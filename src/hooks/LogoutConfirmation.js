// LogoutConfirmation.js
import { useEffect, useState, useRef } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLectureContext } from '../context/lectureContext';
import { useDomain } from "../context/domaincontext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const useLogoutConfirmation = () => {
  const navigation = useNavigation();
  const { clearLectures } = useLectureContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isLoggingOutRef = useRef(isLoggingOut);
  const { domain } = useDomain();

  useEffect(() => {
    isLoggingOutRef.current = isLoggingOut;
  }, [isLoggingOut]);
 
  const triggerLogout = (isAutoLogout, alertMessage) => {
    if (isAutoLogout) {
      autoLogout(navigation, clearLectures, setIsLoggingOut, alertMessage, domain);
    } else {
      confirmLogout(navigation, clearLectures, setIsLoggingOut, domain);
      isAutoLogout=false;
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isLoggingOutRef.current) return;
      
      e.preventDefault();
      console.log('test')
      triggerLogout();
    });
    return unsubscribe;
  }, [navigation, clearLectures]);

  // 훅이 함수처럼 사용될 수 있도록 logout 트리거 함수를 반환
  return triggerLogout;
};

const handleLogout = async (navigation, clearLectures, domain) => {
  try {
    await axios.post(`${domain}/mobile/sign_out.php`, {});
    await AsyncStorage.removeItem('userNm');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('userBd');
    await AsyncStorage.removeItem('userMb');
    clearLectures();

    navigation.reset({
      index: 0,
      routes: [{ name: 'Start' }]
    });
  } catch (error) {
    console.error('Error removing data:', error);
  }
};

//로그아웃 버튼 클릭 시 
export const prevHandleLogout = (navigation) => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Start' }]
    });
};

//자동 로그아웃 구현
const autoLogout = (navigation, clearLectures, setIsLoggingOut, alertMessage, domain) => {
  setIsLoggingOut(true);
  handleLogout(navigation, clearLectures, domain);
  
  Alert.alert(
    '자동 로그아웃',
     alertMessage,
    [
      {
        text: '확인'
      }
    ],
    { cancelable: false }
  );
    
};

const confirmLogout = (navigation, clearLectures, setIsLoggingOut, domain) => {
  Alert.alert(
    '로그아웃',
    '로그아웃 하시겠습니까?',
    [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        onPress: () => {
          setIsLoggingOut(true);
          handleLogout(navigation, clearLectures, domain);
        }
      }
    ],
    { cancelable: false }
  );
};

