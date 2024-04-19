import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn import preprocessing
from sklearn.model_selection import train_test_split
# import metrics
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.utils.class_weight import compute_class_weight

import tensorflow as tf
import keras
from keras import utils
from keras.layers import Dense, Input, Flatten, Dropout, Conv1D, MaxPooling1D, Concatenate, LayerNormalization, GlobalAveragePooling1D
from keras.layers import MultiHeadAttention, TimeDistributed, Bidirectional, LSTM, SimpleRNN
from keras.models import Sequential, Model
from keras.optimizers import Adam
from keras.regularizers import l2

# encoding.py
# oversampling.py

className = ['Slight', 'Serious', 'Fatal']

df_model = pd.read_csv('model-data-os.csv')
df_model.drop(df_model.columns[[0, 2]], axis=1, inplace=True)

target = df_model.pop('labels').values
features = df_model.values
# standardize the data
sclr = preprocessing.StandardScaler()
features = sclr.fit_transform(features)

# split our data
X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2)

num_classes = 3

# label_encoder object knows how to understand word labels.
label_encoder = preprocessing.LabelEncoder()

# Encode labels in column 'species'.
y_train_nn = label_encoder.fit_transform(y_train)
y_test_nn = label_encoder.fit_transform(y_test)
y_train_ann = utils.to_categorical(y_train_nn, num_classes)
y_test_ann = utils.to_categorical(y_test_nn, num_classes)
# X_test = X_test.reshape(-1, 50, 1)
# X_train = X_train.reshape(-1, 50, 1)

def as_masks(arr):
    n_classes = arr.max()+1
    one_hot = np.eye(n_classes)[arr]
    return [m == 1 for m in one_hot.T]

# num_classes = 3


def disp_conf_matrix(cm, class_names = className):
    cm = cm.astype(np.float32) / cm.sum(axis=1)[:, None]
    df_cm = pd.DataFrame(cm, class_names, class_names)
    ax = sns.heatmap(df_cm, annot=True, cmap='flare')
    ax.set_xlabel('Predicted label')
    ax.set_ylabel('True label')
    plt.show()

def perf_m(y_true, y_pred, modelName):
    acc  = accuracy_score(y_true, y_pred) * 100
    prec = precision_score(y_true, y_pred, average='weighted')
    f1 = f1_score(y_true, y_pred, average='weighted')
    rec = recall_score(y_true, y_pred, average='weighted')
    disp_conf_matrix(confusion_matrix(y_true, y_pred), class_names = className)

    return pd.DataFrame({'Modelname':[modelName], 'Accuracy':acc, 'Precision': prec, 'F1 score':f1, 'Recall':rec})

# CNN Model
model = Sequential([
          Conv1D(filters=128, kernel_size=3, activation='relu', input_shape=(X_train.shape[1], 1)),
          MaxPooling1D(pool_size=2),
          Conv1D(filters=32, kernel_size=3, activation='relu'),
          MaxPooling1D(pool_size=2),
          Flatten(),
          Dense(10, activation='relu'),
          Dense(3, activation = 'softmax')
          ])

# # # Train the cnn model (on GPU)
# # opt = Adam(learning_rate=0.0001)
# # with tf.device('/device:GPU:0'):
# #     model.compile(loss='categorical_crossentropy', metrics=['accuracy'], optimizer=opt)
# #     history_cnn = model.fit(X_train, y_train_ann, epochs=40, validation_split = 0.15, batch_size=100, verbose=1)

# # !!! RUN THIS CODE AGAIN !!!

# # model.save('cnn_model')
cnn_model = keras.models.load_model('cnn_model')

# # #PLot training and validation losses
# # plt.plot(history_cnn.history['loss'])
# # plt.plot(history_cnn.history['val_loss'])
# # plt.title('Losses for CNN model')
# # plt.ylabel('Losses')
# # plt.xlabel('Epoch')
# # plt.legend(['training loss', 'validation loss'], loc='upper right')
# # plt.show()

# Evaluate the CNN model
ypred = cnn_model.predict(X_test)
perf_cnn = perf_m(y_test, np.argmax(ypred, axis=1), 'CNN')
print(perf_cnn)


#LSTM Model
model = Sequential([
    LSTM(128, input_shape=(X_train.shape[1], 1)),
    Dropout(0.2),
    Dense(32, activation='relu'),
    Dropout(0.2),
    Dense(3,activation = 'softmax')
])

# # Train the lstm model (on GPU)
# opt = Adam(learning_rate=0.0001)
# with tf.device('/device:GPU:0'):
#     model.compile(loss='categorical_crossentropy', metrics=['accuracy'], optimizer=opt)
#     history_lstm= model.fit(X_train, y_train_ann, epochs=20, validation_split = 0.15, batch_size=100, verbose=1)

# model.save('lstm_model')
# lstm_model = keras.models.load_model('lstm_model')

# #PLot training and validation losses
# plt.plot(history_lstm.history['loss'])
# plt.plot(history_lstm.history['val_loss'])
# plt.title('Losses for LSTM model')
# plt.ylabel('Losses')
# plt.xlabel('Epoch')
# plt.legend(['training loss', 'validation loss'], loc='upper right')
# plt.show()

# # Evaluate the lstm model
# ypred = model.predict(X_test)
# perf_lstm = perf_m(y_test, np.argmax(ypred, axis=1), 'LSTM')
# print(perf_lstm)


# #RNN Model
# model = Sequential([
#           SimpleRNN(32, input_shape=(None, 1)),
#           Dropout(0.2),
#           Dense(32, activation='relu'),
#           Dense(3, activation = 'softmax')
#           ])

# # opt = Adam(learning_rate=0.0001)
# # with tf.device('/device:GPU:0'):
# #     model.compile(loss='categorical_crossentropy', metrics=['accuracy'], optimizer=opt)
# #     history_rnn = model.fit(X_train, y_train_ann, epochs=40, validation_split = 0.15, batch_size=100, verbose=1)

# # model.save('rnn_model')
rnn_model = keras.models.load_model('rnn_model')

# # #Plot training and validation losses
# # plt.plot(history_rnn.history['loss'])
# # plt.plot(history_rnn.history['val_loss'])
# # plt.title('Losses for RNN model')
# # plt.ylabel('Losses')
# # plt.xlabel('Epoch')
# # plt.legend(['training loss', 'validation loss'], loc='upper right')
# # plt.show()

# Evaluate the RNN model
ypred = rnn_model.predict(X_test)
perf_rnn = perf_m(y_test, np.argmax(ypred, axis=1), 'RNN')
print(perf_rnn)