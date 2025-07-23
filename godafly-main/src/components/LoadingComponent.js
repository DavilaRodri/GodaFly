import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

import Modal from 'react-native-modal';
import {scale} from 'react-native-size-matters';

import {colors} from '../utils/constants';
import PropTypes from 'prop-types';

const LoadingComponent = props => {
  return (
    props.isVisible && (
      <Modal
        isVisible={props.isVisible}
        backdropOpacity={0.5}
        animationIn={'fadeIn'}
        animationOut={'fadeOut'}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator
            size="large"
            color={colors.primary_color}
            animating={props.isVisible}
          />
        </View>
      </Modal>
    )
  );
};

const styles = StyleSheet.create({
  activityIndicatorWrapper: {
    backgroundColor: colors.white,
    height: scale(80),
    width: scale(80),
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

LoadingComponent.propTypes = {
  isVisible: PropTypes.bool,
};
LoadingComponent.defaultProps = {
  isVisible: false,
};

export default LoadingComponent;
