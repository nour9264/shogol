import { Link } from 'react-router-dom';
import { FaSearch, FaRocket, FaShieldAlt, FaClock, FaUsers } from 'react-icons/fa';

const Home = () => {
  const features = [
    {
      icon: <FaRocket className="text-4xl text-primary-500" />,
      title: 'مفهوم جديد',
      description: 'منصة عصرية تجمع أفضل المواهب مع أفضل المشاريع',
    },
    {
      icon: <FaShieldAlt className="text-4xl text-green-500" />,
      title: 'شمولية في الخدمات',
      description: 'نوفر لك كل ما تحتاجه لإنجاز مشروعك بنجاح',
    },
    {
      icon: <FaClock className="text-4xl text-blue-500" />,
      title: 'ثمن للوقت',
      description: 'نحترم وقتك ونساعدك على إنجاز مشاريعك في أسرع وقت',
    },
    {
      icon: <FaUsers className="text-4xl text-purple-500" />,
      title: 'حرية في التعامل',
      description: 'تواصل مباشر بين أصحاب المشاريع والمستقلين المحترفين',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'مشروع مكتمل' },
    { number: '5,000+', label: 'مستقل محترف' },
    { number: '3,000+', label: 'عميل راضٍ' },
    { number: '98%', label: 'نسبة النجاح' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="gradient-primary text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              منصة شغل
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-white/90">
              هناك حقيقة مثبتة منذ زمن طويل وهي أن المحتوى المقروء لصفحة ما سيلهي القارئ
              عن التركيز على الشكل الخارجي للنص أو شكل توضع الفقرات في الصفحة التي يقرأها
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-strong p-3 max-w-2xl mx-auto">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن مشروع، مهارة، أو مستقل..."
                    className="w-full pr-12 pl-4 py-4 text-gray-900 rounded-lg focus:outline-none"
                  />
                </div>
                <button className="btn btn-primary px-8">
                  بحث
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-50">
                ابدأ كمستقل
              </Link>
              <Link to="/post-job" className="btn btn-outline border-white text-white hover:bg-white/10">
                انشر مشروعك
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">لماذا طلب عرض سعر أفضل؟</h2>
            <p className="section-subtitle">
              نوفر لك تجربة فريدة في عالم العمل الحر
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-secondary text-white py-16">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">كيف يعمل شغل؟</h2>
            <p className="section-subtitle">
              ثلاث خطوات بسيطة لإنجاز مشروعك
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">انشر مشروعك</h3>
              <p className="text-gray-600">
                أضف تفاصيل مشروعك وميزانيتك والمدة الزمنية المطلوبة
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">استقبل العروض</h3>
              <p className="text-gray-600">
                سيتقدم المستقلون بعروضهم وستختار الأفضل منهم
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">أنجز المشروع</h3>
              <p className="text-gray-600">
                تعاون مع المستقل المختار وأنجز مشروعك بنجاح
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-primary text-white py-20">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            هل أنت مستعد للبدء؟
          </h2>
          <p className="text-xl mb-8 text-white/90">
            انضم إلى آلاف المستقلين وأصحاب المشاريع الناجحين
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 text-lg">
              ابدأ الآن مجاناً
            </Link>
            <Link to="/about" className="btn btn-outline border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
              تعرف على المزيد
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

