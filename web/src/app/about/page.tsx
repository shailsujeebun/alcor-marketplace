import { Target, Award, Users } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Про АЛЬКОР | Marketplace',
  description: 'Фінансовий лізинг спецтехніки та обладнання',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container-main">
        {/* Hero Section */}
        <div className="text-center mb-20" data-aos="fade-up">
          <h1 className="gradient-text text-5xl md:text-6xl font-heading font-bold mb-6">
            Про АЛЬКОР
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
            Ми — провідна компанія з фінансового лізингу спецтехніки та обладнання в Україні.
            Наша місія — допомогти бізнесу розвиватися через доступне фінансування якісної техніки.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div
            className="glass-card p-8 text-center card-hover"
            data-aos="fade-up"
            data-aos-delay="0"
          >
            <div className="text-4xl font-heading font-bold text-blue-bright mb-2">
              10+
            </div>
            <div className="text-[var(--text-secondary)]">років на ринку</div>
          </div>

          <div
            className="glass-card p-8 text-center card-hover"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="text-4xl font-heading font-bold text-blue-bright mb-2">
              5000+
            </div>
            <div className="text-[var(--text-secondary)]">Клієнтів</div>
          </div>

          <div
            className="glass-card p-8 text-center card-hover"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div className="text-4xl font-heading font-bold text-blue-bright mb-2">
              ₴2B+
            </div>
            <div className="text-[var(--text-secondary)]">Профінансовано</div>
          </div>

          <div
            className="glass-card p-8 text-center card-hover"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <div className="text-4xl font-heading font-bold text-blue-bright mb-2">
              98%
            </div>
            <div className="text-[var(--text-secondary)]">Задоволених клієнтів</div>
          </div>
        </div>

        {/* Mission and Values */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Mission */}
          <div className="glass-card p-8 card-hover" data-aos="fade-up" data-aos-delay="0">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-bright/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-bright" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-[var(--text-primary)]">
                Наша місія
              </h2>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
              Забезпечити українським підприємствам доступ до сучасної спецтехніки та обладнання
              через гнучкі лізингові рішення, що сприяють розвитку бізнесу та зростанню економіки країни.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Ми віримо, що кожна компанія заслуговує на можливість оновлювати свій парк техніки
              без значних фінансових навантажень, зберігаючи при цьому конкурентоспроможність
              на ринку.
            </p>
          </div>

          {/* Values */}
          <div className="glass-card p-8 card-hover" data-aos="fade-up" data-aos-delay="100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-bright/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-blue-bright" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-[var(--text-primary)]">
                Наші цінності
              </h2>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-bright mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-[var(--text-primary)] mb-1">Прозорість</div>
                  <div className="text-[var(--text-secondary)] text-sm">
                    Чесні умови співпраці без прихованих комісій
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-bright mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-[var(--text-primary)] mb-1">Партнерство</div>
                  <div className="text-[var(--text-secondary)] text-sm">
                    Індивідуальний підхід до кожного клієнта
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-bright mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-[var(--text-primary)] mb-1">Професіоналізм</div>
                  <div className="text-[var(--text-secondary)] text-sm">
                    Експертиза у фінансуванні будь-якого обладнання
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-bright mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-[var(--text-primary)] mb-1">Швидкість</div>
                  <div className="text-[var(--text-secondary)] text-sm">
                    Оперативне прийняття рішень та оформлення
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Team Section */}
        <div className="glass-card p-8 md:p-12 mb-20 card-hover" data-aos="fade-up">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-blue-bright/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-bright" />
            </div>
            <h2 className="text-3xl font-heading font-bold text-[var(--text-primary)]">
              Наша команда
            </h2>
          </div>
          <div className="max-w-3xl">
            <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
              АЛЬКОР — це команда досвідчених фінансистів, аналітиків та менеджерів, які
              об'єднані спільною метою: зробити лізинг простим та доступним для кожного бізнесу.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
              Наші фахівці мають багаторічний досвід роботи у фінансовому секторі, глибоке
              розуміння потреб різних галузей економіки та індивідуальний підхід до кожного клієнта.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Ми постійно вдосконалюємо наші сервіси, щоб надавати найкращі умови фінансування
              та супроводу протягом усього терміну дії лізингового договору.
            </p>
          </div>
        </div>

        {/* Contact CTA */}
        <div
          className="glass-card p-12 text-center card-hover"
          data-aos="fade-up"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-[var(--text-primary)] mb-4">
            Готові розпочати співпрацю?
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
            Зв'яжіться з нами, і ми підберемо оптимальне лізингове рішення для вашого бізнесу
          </p>
          <Link
            href="/#contact"
            className="gradient-cta inline-block px-8 py-4 rounded-lg font-semibold text-white transition-all hover:scale-105"
          >
            Зв'язатися з нами
          </Link>
        </div>
      </div>
    </div>
  );
}
