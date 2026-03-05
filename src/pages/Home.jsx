import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import RoleFeatures from '../components/RoleFeatures';
import RoleCTA from '../components/RoleCTA';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <div className="min-h-screen bg-dark overflow-x-hidden">
            <Navbar />
            <main>
                <Hero />
                <Features />
                <RoleFeatures />
                <RoleCTA />
            </main>
            <Footer />
        </div>
    );
};

export default Home;
