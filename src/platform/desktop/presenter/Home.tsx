import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import HomeLayout from '../layout/HomeLayout';

const DesktopHome = () => {
  return (
    <HomeLayout>
      <Link to={'/test'}>
        <Button>Test Home</Button>
      </Link>
    </HomeLayout>
  )
}

export default DesktopHome;