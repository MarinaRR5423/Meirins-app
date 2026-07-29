import React from 'react';
import { Text } from 'react-native';
import { F } from '../theme/fonts';

export default function BText({ style, ...props }) {
 return <Text style={[{ fontFamily: F.body }, style]} {...props} />;
}
