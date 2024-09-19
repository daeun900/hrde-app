import React, { useRef, useState } from 'react';
import { View, ScrollView, Image, Dimensions, StyleSheet, TouchableOpacity, Text, Animated, Modal } from 'react-native';

const ImageSliderModal = ({ isVisible, onClose }) => {
  const { width, height } = Dimensions.get('window');
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const images = [
    require('../../assets/guide01.png'),
    require('../../assets/guide02.png'),
    require('../../assets/guide03.png'),
    require('../../assets/guide04.png'),
    require('../../assets/guide05.png'),
    require('../../assets/guide06.png'),
  ];

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false, listener: handleScroll }
          )}
          scrollEventThrottle={16}
        >
          {images.map((image, index) => (
            <Image
              key={index}
              source={image}
              style={[styles.fullscreenImage, { width, height }]}
            />
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>닫기</Text>
        </TouchableOpacity>

        <View style={styles.pagination}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom:50
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#F70101',
  },
  inactiveDot: {
    backgroundColor: '#90A4AE',
  },
});

export default ImageSliderModal;
