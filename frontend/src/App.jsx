import './App.css'
import BannerSection from './components/Baneer'
import ChatBot from './components/Chatbot'
import DentalProgram from './components/DentalProgram'
import Footer from './components/Footer'
import FooterBanner from './components/FooterBanner'
import HelpCommunity from './components/HelpCommunity'
import Invest from './components/Invest'
import Language from './components/Language'
import MBBSInfo from './components/MBBSInfo'
import Navbartop from './components/Navbartop'
import NewsGPT from './components/NewsGPT'
import StudyOptions from './components/StudyOptions'
import Techarts from './components/Techarts'
import TestimonialSection from './components/TestimonialSection'
import WhatsAppButton from './components/WhatsAppButton'
function App() {
  return (
    <div className='total'>
      <Navbartop />
      <BannerSection />
      <div id='tech'>
        <Techarts />
      </div>
      <div id='mbbs'>
        <MBBSInfo />
      </div>
      <div id='study'>
        <StudyOptions/>
      </div>

      <div id='language'>
        <Language />
      </div>
           
      <div id='work'>
      <HelpCommunity />
      </div>
      
      <div id='invest'>
        <Invest/>
      </div>
      <NewsGPT />
      <TestimonialSection />
      <Footer />
      <FooterBanner/>
      <WhatsAppButton />
      <ChatBot/>
    </div>
  )
}

export default App
