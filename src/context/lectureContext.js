import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const LectureContext = createContext();

export const LectureProvider = ({ children }) => {
  const [lectures, setLectures] = useState([]);
  const [progressP, setProgressP] = useState(null); 
  const [loading, setLoading] = useState(true); 

  const fetchLectureData = async () => {
    setLoading(true);
    try {
      const userIdSession = await AsyncStorage.getItem('userId');
      const userData = JSON.parse(userIdSession);
      if (userData && userData.value) {
        const userId = userData.value;
        console.log('userId 값 ---->', userId);
        const response = await axios.post("https://hrdelms.com/mobile/lecture_list.php", { id: userId });

        console.log('Server response:', response.data);
        
        const lectureList = response.data.data;

        const formattedLectureList = lectureList.map((lecture, index) => {
          if (progressP !== null) { // Update ProgressP if it's different
            setProgressP(lecture[4]); // Set ProgressP from the fetched data
          }
          return {
            id: index.toString(),
            ContentsName: lecture[0],
            ProgressStep: lecture[1],
            ProgressNum: lecture[2],
            Chapter: lecture[3],
            ProgressP: lecture[4],
            Seq: lecture[5]
          };
        });

        setLectures(formattedLectureList);
      }
    } catch (err) {
      console.log(`Error fetching lecture data: ${err}`);
    } finally {
      setLoading(false);  // 데이터 가져온 후 로딩 상태 종료
    }
  };

  const clearLectures = () => {
    setLectures([]);
  };

  useEffect(() => {
    fetchLectureData(); // 컴포넌트가 처음 마운트될 때 데이터 가져오기
  }, []);
  
  useEffect(() => {
    fetchLectureData(); // progressP 변경될 때마다 데이터 업데이트
  }, [progressP]); 

  return (
    <LectureContext.Provider value={{ lectures, fetchLectureData, clearLectures, progressP }}>
      {children}
    </LectureContext.Provider>
  );
};

export const useLectureContext = () => useContext(LectureContext);
