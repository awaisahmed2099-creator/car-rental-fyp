'use client';

import React, { useState } from 'react';
import { Check, Zap, Shield } from 'lucide-react';
import { getPaddle } from '@/lib/paddle';

const PADDLE_MONTHLY_PRICE_ID = "pri_01kxz6azwv4sgp7snj61340nmh";
const PADDLE_YEARLY_PRICE_ID = "pri_01kxz6c9nhxb6tknysxp277zrs";


const FREE_FEATURES = [
  'Up to 5 vehicles',
  'Basic booking management',
  'Customer management',
  'Email support',
  'Basic analytics',
  'Fleet dashboard',
];

const PRO_FEATURES = [
  'Unlimited vehicles',
  'Advanced booking system',
  'Driver management',
  'Priority support',
  'Advanced analytics',
  'API access',
  'Custom reports',
  'Business insights',
];

const FAQS = [
  {
    q: 'Can I switch plans at any time?',
    a: 'Yes. Upgrade or downgrade whenever you need. Changes apply immediately, and billing is prorated to the day.',
  },
  {
    q: 'Is there a free trial on the Pro plan?',
    a: 'Yes — Pro includes a 14-day free trial. No credit card required to start. Trial terms are shown at checkout.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept all major cards and Paddle-supported local payment methods. Taxes and VAT are automatically handled at checkout.',
  },
  {
    q: 'Who processes my payment?',
    a: 'Payments are securely processed by Paddle, our Merchant of Record. We never store your card details.',
  },
];


export default function PricingPage() {

  const [yearly, setYearly] = useState(false);

  const proMonthly = 5;
  const proYearly = 60;


const handleCheckout = async () => {
  try {
    const priceId = yearly
      ? PADDLE_YEARLY_PRICE_ID
      : PADDLE_MONTHLY_PRICE_ID;

    console.log(
      "Selected Plan:",
      yearly ? "Yearly" : "Monthly"
    );

    console.log("Price ID:", priceId);

    const paddle = await getPaddle();

    if (!paddle) {
      throw new Error("Paddle not initialized");
    }

    console.log("Paddle Ready");

    const checkout = await paddle.Checkout.open({
      items: [
        {
          priceId: priceId,
          quantity: 1,
        },
      ],
      settings: {
        displayMode: "overlay",
      },
    });

    console.log("Checkout Response:", checkout);

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        "Checkout Detailed Error:",
        error.message
      );
    } else {
      console.error(
        "Checkout Detailed Error:",
        error
      );
    }

    console.error(
      "Full Error:",
      error
    );
  }
};

  return (
    <div
      style={{ backgroundColor: '#080D1A', fontFamily: "'Inter', sans-serif" }}
      className="min-h-screen text-white"
    >

      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '500px',
          background:
            'radial-gradient(ellipse at center, rgba(249,115,22,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />


      <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">


        <section className="py-16 text-center sm:py-20">

          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-8"
            style={{
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.3)',
              color: '#F97316',
            }}
          >
            <Zap size={12} />
            Pricing
          </div>


          <h1
            className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            style={{ lineHeight: 1.08, letterSpacing: '-0.03em' }}
          >
            Fleet management that
            <br />
            <span style={{ color: '#F97316' }}>
              scales with you
            </span>
          </h1>


          <p
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg"
            style={{ color: '#94A3B8' }}
          >
            Start free with your first five vehicles. When your operation grows,
            one upgrade unlocks the full power of the platform.
          </p>


          <div className="mt-10 flex flex-col items-center gap-3">

            <div
              className="inline-flex rounded-2xl p-1 bg-[#0F172A] border border-white/10"
            >
              <button
                onClick={() => setYearly(false)}
                className={`rounded-xl px-6 py-2.5 text-sm font-semibold cursor-pointer transition-colors ${!yearly ? 'bg-orange-500 text-white' : 'text-[#64748B] hover:bg-orange-500/10 hover:text-orange-500'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`rounded-xl px-6 py-2.5 text-sm font-semibold cursor-pointer transition-colors ${yearly ? 'bg-orange-500 text-white' : 'text-[#64748B] hover:bg-orange-500/10 hover:text-orange-500'}`}
              >
                Yearly
              </button>
            </div>

          </div>

        </section>

                {/* PRICING CARDS */}

        <section className="grid gap-6 sm:grid-cols-2 lg:gap-8">


          {/* FREE CARD */}

          <article
            className="relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:border-orange-500 hover:shadow-lg flex flex-col h-full bg-[#0F172A] border border-white/10"
          >

            <div className="mb-8">

              <div className="flex items-center gap-3 mb-4">

                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10"
                >
                  <Shield size={16} className="text-orange-500" />
                </div>


                <div>

                  <h2 className="text-xl font-bold text-white">
                    Free
                  </h2>

                  <p className="text-xs" style={{color:'#64748B'}}>
                    Perfect for getting started
                  </p>

                </div>

              </div>


              <div className="flex items-end gap-1 mt-6">

                <span className="text-5xl font-bold text-orange-500">
                  $0
                </span>

                <span className="mb-2 text-sm" style={{color:'#475569'}}>
                  /month · forever
                </span>

              </div>

            </div>



            <ul className="mb-8 space-y-3.5">

              {FREE_FEATURES.map((f)=>(
                <li
                  key={f}
                  className="flex items-center gap-3 text-sm"
                  style={{color:'#CBD5E1'}}
                >

                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full"
                    style={{
                      background:'rgba(100,116,139,0.2)'
                    }}
                  >
                    <Check size={11} style={{color:'#94A3B8'}}/>
                  </span>

                  {f}

                </li>
              ))}

            </ul>



            <button
              className="mt-auto w-full bg-orange-500 hover:bg-orange-600 text-white cursor-pointer transition-colors duration-300 rounded-lg py-3 font-semibold"
            >
              Get Started Free
            </button>


          </article>





          {/* PRO CARD */}


          <article
            className="relative rounded-3xl p-8 flex flex-col h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-lg bg-[#0F172A] border-[1.5px] border-orange-500"
            style={{ boxShadow: '0 0 60px -10px rgba(249,115,22,0.25)' }}
          >


            <div
              className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-5 py-1.5 text-xs font-bold uppercase"
              style={{
                background:'#F97316',
                color:'#fff'
              }}
            >
              Most Popular
            </div>



            <div className="mb-8">


              <div className="flex items-center gap-3 mb-4">


                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    background:'rgba(249,115,22,0.15)'
                  }}
                >

                  <Zap size={16} style={{color:'#F97316'}}/>

                </div>



                <div>

                  <h2 className="text-xl font-bold text-white">
                    Pro
                  </h2>

                  <p className="text-xs" style={{color:'#64748B'}}>
                    For serious rental operations
                  </p>

                </div>


              </div>




              <div className="flex items-end gap-1 mt-6">


                <span
                  className="text-5xl font-bold"
                  style={{
                    color:'#F97316'
                  }}
                >

                  ${yearly ? proYearly : proMonthly}

                </span>



                <span className="mb-2 text-sm" style={{color:'#475569'}}>

                  {yearly
                    ? '/year'
                    : '/month'
                  }

                </span>


              </div>



              {yearly && (

                <p
                  className="mt-2 text-xs"
                  style={{color:'#34D399'}}
                >
                  Billed annually
                </p>

              )}


            </div>





            <ul className="mb-8 space-y-3.5">

              {PRO_FEATURES.map((f)=>(

                <li
                  key={f}
                  className="flex items-center gap-3 text-sm text-white"
                >

                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full"
                    style={{
                      background:'rgba(249,115,22,0.2)'
                    }}
                  >

                    <Check
                      size={11}
                      style={{color:'#F97316'}}
                    />

                  </span>


                  {f}


                </li>


              ))}


            </ul>





            <button
              onClick={handleCheckout}
              className="mt-auto w-full bg-orange-500 hover:bg-orange-600 text-white cursor-pointer transition-colors duration-300 rounded-lg py-3 font-semibold"
            >
              Start Free Trial
            </button>



          </article>



        </section>

                {/* FAQ SECTION */}

        <section className="mt-24">

          <div className="mb-10 text-center">

            <p
              className="mb-3 text-xs font-semibold uppercase tracking-widest"
              style={{color:'#F97316'}}
            >
              FAQ
            </p>


            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Common questions
            </h2>


          </div>



          <div className="grid gap-4 sm:grid-cols-2">


            {FAQS.map((item)=>(

              <article
                key={item.q}
                className="rounded-2xl p-6 bg-[#0F172A] border border-white/10 hover:-translate-y-2 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 cursor-default"
              >


                <h3 className="mb-2 text-base font-semibold text-white">

                  {item.q}

                </h3>


                <p
                  className="text-sm leading-relaxed"
                  style={{color:'#64748B'}}
                >

                  {item.a}

                </p>



              </article>


            ))}



          </div>


        </section>



      </main>


    </div>

  );

}