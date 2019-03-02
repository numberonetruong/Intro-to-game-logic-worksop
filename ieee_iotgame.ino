#include <ESP8266WiFi.h>
#include <WebSocketServer.h>

#define WIFI_SSID           "Curtis6T"
#define WIFI_PASS           "Topkek123"
#define WIFI_PORT           80

#define BUTTON_P1A  0
#define BUTTON_P1B  2
#define BUTTON_P2A  3
#define BUTTON_P2B  1

#define MAX_SRV_CLIENTS     1
#define MAX_FRAME_LENGTH    64
#define CALLBACK_FUNCTIONS  1
//#define DEBUGGING

WiFiServer server(WIFI_PORT);
WebSocketServer webSocketServer;

int directionP1a;
int directionP1b;
int directionP2a;
int directionP2b;
int pre_dir_1 = 0;
int pre_dir_2 = 0;
int dir_1 = 0;
int dir_2 = 0;
double currentTime;
double lastTime = 0;

void setup() {
    // set up button pins    
    pinMode(BUTTON_P1A, INPUT_PULLUP); 
    pinMode(BUTTON_P1B, INPUT_PULLUP); 
    
    Serial.begin(9600);
  
    // Connect to WiFi network
    Serial.println();
    Serial.println();
    Serial.print(F("Connecting to "));
    Serial.println(WIFI_SSID);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(F("."));
    }
    Serial.println();
    Serial.println(F("WiFi connected"));
    // Start the server
    server.begin();
    // Print the IP address
    Serial.println(WiFi.localIP());

    delay(100);
    
    Serial.end();
    pinMode(BUTTON_P2A, INPUT_PULLUP); 
    pinMode(BUTTON_P2B, INPUT_PULLUP); 
    
    
}

void sendClientData() {
  // logic for reading buttons and constructing the info to send
  directionP1a = digitalRead(BUTTON_P1A);
  directionP1b = digitalRead(BUTTON_P1B);
  directionP2a = digitalRead(BUTTON_P2A);
  directionP2b = digitalRead(BUTTON_P2B);
  dir_1 = directionP1b - directionP1a;
  dir_2 = directionP2b - directionP2a;
  if(dir_1 != pre_dir_1 || dir_2 != pre_dir_2){
      pre_dir_1 = dir_1;
      pre_dir_2 = dir_2;
      String txtMsg = "[" + String(dir_1) + ", " + String(dir_2) + "]\r\n"; 
      //Serial.print(txtMsg); 
      webSocketServer.sendData(txtMsg);
  }
}

void loop() {
  
  WiFiClient client = server.available();
  
  if (client.connected() && webSocketServer.handshake(client)) { 
    while (client.connected()) {
      
      // call sendClientData to handle button logic and send
      sendClientData();
      
      // this delay is CRITICAL, 
      // esp8266 needs break time to do wifi tasks, or else will crash!
      delay(10);
      
    }
  }
  
  // wait to fully let the client disconnect
  delay(100);
}
