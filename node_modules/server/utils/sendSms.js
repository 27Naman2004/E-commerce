// Mock SMS Service for Local Development
// In production, integrate Twilio, AWS SNS, Msg91, etc. using process.env.SMS_API_KEY

const sendSms = async (options) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n=============================================');
    console.log(`📱 MOCK SMS SENT`);
    console.log(`To: ${options.to}`);
    console.log(`Message: ${options.message}`);
    console.log('=============================================\n');
    return Promise.resolve(true);
  } else {
    // Production integration here
    // Example Twilio integration:
    // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({ ... })
    console.error('Real SMS integration required in production.');
    return Promise.resolve(true);
  }
};

module.exports = sendSms;
