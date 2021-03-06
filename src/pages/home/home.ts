import { Component } from '@angular/core';
import { NavController, Platform, AlertController  } from 'ionic-angular';
import { MediaCapture, MediaFile, CaptureError, CaptureAudioOptions } from '@ionic-native/media-capture';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SpeechRecognition } from '@ionic-native/speech-recognition';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  records: MediaFile[];
  barcode: {text: string, format: string, cancelled: boolean};
  isRecognitionAvailable: boolean = false;
  supportedLanguages: Array<string>;
  matches: Array<string>;
  public unregisterBackButtonAction: any;


  ionViewDidEnter() {
    this.initializeBackButtonCustomHandler();
  }

  ionViewWillLeave() {
    // Unregister the custom back button action for this page
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
  }

  public initializeBackButtonCustomHandler(): void {
    this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => {
      this.customHandleBackButton();
    }, 10);
  }

  private customHandleBackButton(): void {
    // do what you need to do here ...
    console.log('backButton pressed');
  }

  constructor(
    public navCtrl: NavController,
    public mediaCapture: MediaCapture,
    public platform: Platform,
    public alertCtrl: AlertController,
    private barcodeScanner: BarcodeScanner,
    private speechRecognition: SpeechRecognition
    ) {
    platform.ready().then(value => {
      this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => {
        this.customHandleBackButton();
      }, 10);

      this.speechRecognition.isRecognitionAvailable()
        .then((available: boolean) => {
          this.isRecognitionAvailable = available;
          if (available) {
            this.speechRecognition.getSupportedLanguages()
              .then(
                (languages: Array<string>) => {
                  this.supportedLanguages = languages
                  // console.log(languages);
                },
                (error) => console.log(error)
              )
          }
        })

    })
  }

  recordVoice() {
    let options: CaptureAudioOptions = { limit: 1,duration: 5 };
    this.mediaCapture.captureAudio(options)
      .then(
        (data: MediaFile[]) => {
          this.records = data
        },
        (err: CaptureError) => console.error(err)
      );
  }

  scanBarcode() {
    this.barcodeScanner.scan().then((barcodeData) => {
      // Success! Barcode data is here
      console.log(barcodeData);
      this.barcode = barcodeData;
    }, (err) => {
      // An error occurred
      alert(err);
    });
  }

  startSpeechRecognition() {
    let options = {
      language: "it-IT",
      matches: 5, /* default value */
      prompt: "",      // Android only
      showPopup: true, /* default value */ // Android only
      // Boolean showPartial // iOS only
    }
    this.matches = new Array<string>();

    this.speechRecognition.startListening(options)
      .subscribe(
        (matches: Array<string>) => {
          this.matches = matches;
          // console.log(matches)
        },
        (onerror) => {
          console.log('error:', onerror);

          this.speechRecognition.requestPermission()
            .then(
              () => console.log('Granted'),
              () => console.log('Denied')
            )

        }
      )
  }

  exitApplication () {
    let confirm = this.alertCtrl.create({
      title: 'Avviso',
      message: 'Confermi l\'uscita dall\'app?',
      buttons: [
        {
          text: 'Cancella',
          handler: () => {
            console.log('Cancella clicked');
          }
        },
        {
          text: 'Esci',
          handler: () => {
            this.platform.exitApp();
          }
        }
      ]
    });
    confirm.present();
  }

}
