import { useEffect, useCallback, useContext } from 'react';
import { Alert, BackHandler } from 'react-native';
import { UserContext } from '../context/userContext';
import { useLectureContext } from '../context/lectureContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useLogoutHandler = (navigation, domain) => {

const { clearLectures } = useLectureContext();
const { clearUserData } = useContext(UserContext);

  const handleLogout = useCallback(async () => {
    try {
      await axios.post(`${domain}/mobile/sign_out.php`);
      await AsyncStorage.clear(); // 모든 사용자 데이터 제거
      clearLectures();
      clearUserData();

      navigation.reset({
        index: 0,
        routes: [{ name: 'Start' }], // 'Start' 화면으로 초기화
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [navigation, clearLectures, clearUserData, domain]);

  const confirmLogout = useCallback(() => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: handleLogout },
      ],
      { cancelable: false }
    );
  }, [handleLogout]);

  useEffect(() => {
    const handleBackPress = () => {
      confirmLogout();
      return true; // 기본 뒤로가기 동작 막기
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => backHandler.remove();
  }, [confirmLogout]);

  return null; // 필요 시 특정 UI 요소를 반환하도록 수정 가능
};

export default useLogoutHandler;
