import React, {useState, forwardRef} from "react";
import styled from "styled-components/native";
import PropTypes from 'prop-types';

const Container = styled.View`
    flex-direction: column;
    width: 100%;
    margin: 10px 0;
`

const Label = styled.Text`
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
`

const StyledInput = styled.TextInput.attrs(({theme})=> ({placeholderTextColor: theme.inputPlaceholder}))`
    background-color: #ffffff ;
    color: #111111;
    padding: 20px 10px;
    font-size: 16px;
    border: 1px solid ${({theme, isFocused}) => isFocused ? '#ccc' : '#eee'};
    border-radius: 4px;
`
 
const Input = forwardRef(
({
    label,
    value,
    onChangeText,
    onSubmitEditing,
    onBlur,
    placeholder,
    returnKeyType,
    maxLength,
    isPassword,
    inputStyle,
    containerStyle,
    keyboardType,
}, ref) => {
    const [isFocused, setIsFocused] = useState(false);


    return(
        <Container style={containerStyle}>
            <Label>{label}</Label>
            <StyledInput
                ref={ref}
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmitEditing}
                onBlur={()=>{
                    setIsFocused(false);
                    onBlur();
                }}
                placeholder={placeholder}
                returnKeyType={returnKeyType}
                maxLength={maxLength}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="none"
                isFocused={isFocused}
                onFocus ={()=> setIsFocused(true)}
                secureTextEntry={isPassword}
                style={inputStyle}
                containerStyle={containerStyle}
                keyboardType={keyboardType} 
            ></StyledInput>
        </Container>
    )
}
)
Input.defaultProps={
    onBlur: () =>{}
}

Input.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string.isRequired,
    onChangeText: PropTypes.func,
    onSubmitEditing: PropTypes.func,
    onBlur: PropTypes.func,
    placeholder: PropTypes.string,
    returnKeyType: PropTypes.oneOf(['done','next']),
    maxLength: PropTypes.number,
    isPassword: PropTypes.bool,
    inputStyle: PropTypes.object,
    containerStyle: PropTypes.object, 
    keyboardType: PropTypes.string
}


export default Input