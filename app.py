from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn import preprocessing
import tensorflow as tf

app = Flask(__name__)
CORS(app)

model = tf.keras.models.load_model('rnn_model')

@app.route('/predict', methods=['POST'])
def predict():
    input_data = request.json['input_data']
    # input_data = np.array(input_data)

    # input_data = [[22.06649894,	82.19014705,	1,	2,	30,	13,	21,	400,	0,	0,	0,	0,	0,	1,	0,	1,	0,	0,	0,	0,	0,	0,	0,	0,	1,	1,	1,	0,	0,	1,	0,	0,	1,	0,	0,	1,	0,	0,	0,	0,	0,	0,	0,	0,	1,	0,	0,	1,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	1,	0,	1,	0,	0],
    #      [14.74996632,	78.51960607,    2,	1,	60,	18,	21,	1396,	0,	0,	0,	0,	0,	0,	0,	1,	0,	0,	0,	0,	1,	0,	0,	0,	0,	0,	1,	0,	0,	1,	0,	0,	0,	0,	1,	1,	0,	0,	0,	0,	0,	0,	0,	0,	1,	0,	0,	0,	1,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	1,	0,	0,	1,	0,	0],
    #      [14.6911247,	78.64223571,	1,	2,	60,	9,	7,	1598,	0,	0,	1,	0,	0,	0,	0,	1,	0,	0,	0,	0,	1,	0,	0,	0,	0,	1,	0,	0,	0,	1,	0,	0,	0,	0,	0,	0,	0,	0,	1,	0,	0,	0,	0,	0,	1,	0,	0,	0,	1,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	1,	0,	1,	0,	0,	0],
    #      [14.72402585,  78.61039332,    1,  1,  60, 15, 9,  1461,   0,  0,  0,  1,  0,  0,  0,  1,  0,  0,  0,  0,  1,  0,  0,	0,	0,	1,	1,	0,	0,	1,	0,	0,	0,	0,	0,	0,	0,	0,	1,	0,	0,	0,	0,	0,	1,	0,	0,	1,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	1,	0,	1,	0,	0,	0],
    #      [14.69047677,	78.47719655,	1,	1,	60,	15,	7,	1834,	0,	0,	0,	0,	0,	0,	0,	1,	0,	0,	0,	0,	1,	0,	0,	0,	0,	1,	0,	0,	0,	1,	0,	0,	0,	0,	0,	0,	0,	0,	1,	0,	0,	0,	0,	0,	0,	0,	0,	0,	1,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	1,	0,	0,	1,	0,	0],
    #      [22.09172122,	82.13272203,	1,	2,	30,	8,	3,	1896,	0,	0,	0,	0,	0,	1,	0,	1,	0,	0,	0,	0,	0,	0,	0,	0,	1,	1,	0,	0,	0,	1,	0,	0,	1,	0,	0,	0,	0,	0,	0,	1,	0,	0,	0,	0,	1,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	1,	0,	0,	0,	0,	1,	0,	0,	0,	1,	0], #0
    #      [26.47553786,	74.65648777,	1,	4,	30,	10,	12,	1896,	0,	0,	0,	0,	0,	1,	0,	1,	0,	0,	0,	0,	0,	0,	0,	0,	0,	1,	0,	0,	0,	1,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	1,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	1,	0,	0,	0,	0,	1,	0,	0,	1,	0,	0], #2
    #      [18.57087782,	73.73664673,	1,	2,	40,	16,	2,	1896,	0,	0,	0,	0,	0,	1,	0,	1,	0,	0,	0,	0,	0,	0,	0,	0,	1,	0,	1,	0,	0,	0,	0,	0,	1,	0,	0,	0,	0,	1,	0,	0,	0,	0,	0,	0,	1,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	1,	0,	0,	0,	0,	1,	0,	0,	0,	0,	1]] #0

    sclr = preprocessing.StandardScaler()
    X_new = sclr.fit_transform(input_data)
    
    y_pred = model.predict(X_new)
    predictions = np.argmax(y_pred, axis=1)
    return jsonify({'predictions': predictions.tolist()})

if __name__ == '__main__':
    app.run(debug=True)
