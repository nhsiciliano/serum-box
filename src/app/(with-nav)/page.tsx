import { Box } from '@chakra-ui/react';
import HomeContent from '../../components/HomeContent';
import FeatureSlider from '../../components/FeatureSlider';
import Testimonials from '../../components/Testimonials';
import FAQSection from '../../components/FAQSection';

export default function Home() {
  return (
    <Box>
      <HomeContent />
      <FeatureSlider />
      <Testimonials />
      <FAQSection />
    </Box>
  );
}
