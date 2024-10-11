// LogoutConfirmation.js
import { useEffect, useState, useRef } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLectureContext } from '../context/lectureContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const useLogoutConfirmation = () => {
  const navigation = useNavigation();
  const { clearLectures } = useLectureContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isLoggingOutRef = useRef(isLoggingOut);

  useEffect(() => {
    isLoggingOutRef.current = isLoggingOut;
  }, [isLoggingOut]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isLoggingOutRef.current) {
        return;
      }

      e.preventDefault();
      confirmLogout(navigation, clearLectures, setIsLoggingOut);
    });

    return unsubscribe;
  }, [navigation, clearLectures]);

  return { setIsLoggingOut, handleLogout };
};

// handleLogout 함수 별도로 정의하여 export
export const handleLogout = async (navigation, clearLectures) => {
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

export default useLogoutConfirmation;
