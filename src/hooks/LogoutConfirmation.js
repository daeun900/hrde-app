// LogoutConfirmation.js
import { useEffect, useState, useRef } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLectureContext } from '../context/lectureContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const useLogoutConfirmation = () => {
  const navigation = useNavigation();
  const { clearLectures } = useLectureContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isLoggingOutRef = useRef(isLoggingOut);

  useEffect(() => {
    isLoggingOutRef.current = isLoggingOut;
  }, [isLoggingOut]);
 
  const triggerLogout = (isAutoLogout, LogoutType) => {
    if (isAutoLogout) {
      autoLogout(navigation, clearLectures, setIsLoggingOut, LogoutType);
    } else {
      confirmLogout(navigation, clearLectures, setIsLoggingOut);
      isAutoLogout=false;
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isLoggingOutRef.current) return;
      
      e.preventDefault();
      triggerLogout();
    });
    return unsubscribe;
  }, [navigation, clearLectures]);

  // 훅이 함수처럼 사용될 수 있도록 logout 트리거 함수를 반환
  return triggerLogout;
};

const handleLogout = async (navigation, clearLectures) => {
  try {
    await axios.post('https://hrdelms.com/mobileTest/sign_out.php', {});
    await AsyncStorage.removeItem('userNm');
    await AsyncStorage.removeItem('userId');
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
const autoLogout = (navigation, clearLectures, setIsLoggingOut, LogoutType) => {

  let alertMessage = '';

  if (LogoutType === 'A') {
    alertMessage = '다른 기기에서 로그인하여 로그아웃 처리됩니다.';
  } else if (LogoutType === 'B') {
    alertMessage = '세션이 만료되어 로그아웃 처리됩니다.';
  }

  Alert.alert(
    '자동 로그아웃',
     alertMessage,
    [
      {
        text: '확인',
        onPress: () => {
          setIsLoggingOut(true);
          handleLogout(navigation, clearLectures);
        }
      }
    ],
    { cancelable: false }
  );
    
};

const confirmLogout = (navigation, clearLectures, setIsLoggingOut) => {
  Alert.alert(
    '로그아웃',
    '로그아웃 하시겠습니까?',
    [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        onPress: () => {
          setIsLoggingOut(true);
          handleLogout(navigation, clearLectures);
        }
      }
    ],
    { cancelable: false }
  );
};

