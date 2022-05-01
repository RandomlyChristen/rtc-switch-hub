#include <SoftwareSerial.h>
#include <Servo.h>

// 0 : D8         -> LED
// 1 : D1
// 2 : 온보드엘이디
// 3 : D0
// 4 : D4         -> 블루투스 TX
// 5 : D3         -> 블루투스 RX
// 6 : --
// ...
// 14 : D5        -> 서보모터

SoftwareSerial BTSerial(4, 5);
const int DIGITAL_OUT = 0;
const int SERVO = 14;
const int SENSOR = A0;

const int SWITCH_ONEWAY = 0;
const int SWITCH_BIWAY = 1;

Servo servo;

void setup() {
  Serial.begin(9600);
  BTSerial.begin(9600);
  pinMode(SENSOR, INPUT);
  pinMode(DIGITAL_OUT, OUTPUT);
  servo.attach(SERVO);
  servo.write(90);
}

int sensor_value = 0;
int switch_value = 0;
int threshold_value = 700;
int switch_type = 0;

void loop() {
  sensor_value = analogRead(SENSOR);
  if (sensor_value > threshold_value) {
    digitalWrite(DIGITAL_OUT, LOW);
    if (switch_value) {
      if (switch_type == SWITCH_ONEWAY) {
        servo.write(0);
        delay(500);
        servo.write(90);
      }
      else if (switch_type == SWITCH_BIWAY) {
        servo.write(180);
        delay(500);
        servo.write(90);
      }
      switch_value = 0;
    }
  }
  else {
    digitalWrite(DIGITAL_OUT, HIGH);
    if (!switch_value) {
      servo.write(0);
      delay(500);
      servo.write(90);
    }
    switch_value = 1;
  }

  if (BTSerial.available()) {
    Serial.write(BTSerial.read());
  }

//  if (Serial.available()) {
//    BTSerial.write(Serial.read());
//  }
  BTSerial.printf("{\"sensor\":%d, \"threshold\":%d, \"type\":%d, \"switch\":%d}\n",
    sensor_value, threshold_value, switch_type, switch_value
  );
  Serial.printf("{\"sensor\":%d, \"threshold\":%d, \"type\":%d, \"switch\":%d}\n",
    sensor_value, threshold_value, switch_type, switch_value
  );
  delay(1000);
}