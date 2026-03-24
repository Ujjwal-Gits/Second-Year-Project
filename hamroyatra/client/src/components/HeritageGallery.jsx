import React from "react";

const HeritageGallery = () => {
  // Keep the names as requested, but update images to only be Kathmandu Valley, Chitwan Village, and Swayambhunath
  const row1 = [
    {
      id: 1,
      title: "Patan Durbar Square",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBactHcGKXMoYMor39Rnt_15hSMjKv3UgEOf5nU4FI-GV9EiOZUKsTes5CAWHA956QcUnAvkZqt3IhGUImlEk36F2fnCXp2ZnHB6rWAl9dR5mkIS4KGUg7wvm7SgVdv9LctdNqR1JRisi7lIJnUdOGeSEO5CdRJIDG1DCRnV-fkDJyCF4aNSPmRpbxeLiJO0EFXBi_6gdpsBGbntsrX0kZK8cudkHMs8I305uBvWi1iSFP1MQRFuNM3VPMZaqQizwm2w6B7FQ71yJI",
    },
    {
      id: 2,
      title: "Boudhanath Stupa",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCXIs5AgVmgcR6WFwhJQqDeFWaQCuVpaYXxVrqCGnu2vxLIT2C5VKoFz4WbcuWxjFLonI7AkjCeUJyY7DnZzTo3DVM_aXxBKo0KNnqdi5fvOZtlTmA1wOk1TojVZLHMM9K9O_hbc_sFaceF7zTFhIq8zlw-fouiOgcz0LGgLbSLu0-hzAuLtpTfDNqXaz1H5VLldPjAFVX6A5lyyJSE2j6PzdjBqgLO8MAvy4rEHyhlDsS6Fd9ZkpbOFZmTdT0B2Tr-dGKuA24jOh8",
    },
    {
      id: 3,
      title: "Bhaktapur Pottery",
      image:
        "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=1470&auto=format&fit=crop",
    },
    {
      id: 4,
      title: "Swayambhunath",
      image:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1471&auto=format&fit=crop",
    },
    {
      id: 5,
      title: "Kathmandu Valley",
      image:
        "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1470&auto=format&fit=crop",
    },
  ];

  const row2 = [
    {
      id: 6,
      title: "Pokhara Old Bazaar",
      image:
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1470&auto=format&fit=crop",
    },
    {
      id: 7,
      title: "Janaki Temple",
      image:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1470&auto=format&fit=crop",
    },
    {
      id: 8,
      title: "Lumbini Garden",
      image:
        "https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=1471&auto=format&fit=crop",
    },
    {
      id: 9,
      title: "Everest Heritage",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBTmGU_CiNKkCbZbHY7q7ZstEOJXPpnwb6Qul3EZ6Xu2ux5lIF1G72VAX8wp7GSc2YvHUsiajJHa2teddQJocO8p40HtCOP_FeJ1FktgM5u7CcQRzykxFNWlLhl0CuKoJJmdrPSMGPIDW7MH2HewjUWokkHOSEqK-kNwYoPlk35d-I6ImWjnwqdQ720tCr-hLhu6MFQV40gmHOXY9y-xUF-mV2uUZFPaFH1apPkR9pv3NG61Ts2dYiw_wSi1eY9PlhZ1hb3J3VDeGo",
    },
    {
      id: 10,
      title: "Chitwan Village",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBGYhYaK6nvVKi37qTjkT4nGNuRlN4yzCgqRt8inQZlqEaYjrrYmYRn60RAr_gcv7ZIpPKEJx4tKtaFiAtvqt11RJ9lKm4bxg0AYMqB4pwCRq0x65mLVZSCwGhR96tkh8d7aP7VAPfv-1Yc_X0GiCq_1d240yKlszCFQ7D53XMthym5cyd2xw3Gsrg2XAHtHRNJw_LPEuJoRiPdOYRv0Ze5m2yt6AJsUdFClRielWKBuo6VpZchfVCYleXXF28vEMfFKCfMc8qfR4s",
    },
  ];

  return (
    <section
      id="heritage-gallery"
      className="py-24 bg-[#fdfdfd] overflow-hidden"
    >
      <div className="max-w-[1300px] mx-auto px-6 md:px-10 mb-16 text-center">
        <span className="text-[#C5A059] font-bold tracking-[0.4em] uppercase text-[9px] mb-3 block">
          Cultural Legacy
        </span>
        <h2 className="font-serif text-4xl md:text-5xl text-primary font-bold mb-4 tracking-tight leading-none">
          Our Heritage Gallery
        </h2>
        <p className="text-gray-500 text-base font-light max-w-2xl mx-auto">
          Witness the timeless beauty and architectural marvels that define the
          soul of Nepal.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:gap-6">
        {/* Row 1: Left to Right */}
        <div className="relative flex overflow-hidden">
          <div className="flex animate-marquee-right whitespace-nowrap gap-4 md:gap-6">
            {[...row1, ...row1].map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="relative shrink-0 w-[240px] md:w-[400px] h-[180px] md:h-[280px] rounded-2xl overflow-hidden shadow-xl"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 text-white">
                  <p className="text-sm md:text-lg font-bold tracking-tight">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Right to Left */}
        <div className="relative flex overflow-hidden">
          <div className="flex animate-marquee-left whitespace-nowrap gap-4 md:gap-6">
            {[...row2, ...row2].map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="relative shrink-0 w-[200px] md:w-[300px] h-[180px] md:h-[280px] rounded-2xl overflow-hidden shadow-xl"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 text-white">
                  <p className="text-sm md:text-lg font-bold tracking-tight">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
                @keyframes marquee-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(calc(-50% - 12px)); }
                }
                @keyframes marquee-right {
                    0% { transform: translateX(calc(-50% - 12px)); }
                    100% { transform: translateX(0); }
                }
                .animate-marquee-left {
                    animation: marquee-left 40s linear infinite;
                }
                .animate-marquee-right {
                    animation: marquee-right 40s linear infinite;
                }
            `,
        }}
      />
    </section>
  );
};

export default HeritageGallery;
