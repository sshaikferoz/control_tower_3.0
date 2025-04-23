import React, { JSX } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

// News data for mapping
const newsArticles = [
    {
        title: "Aramco completes acquisition of 50% stake in Blue Hydrogen",
        titleColor: "text-[#83bd01]",
        content:
            "Partnership aims to accelerate industrial carbon reduction and encourage growth of the hydrogen the economy of removing 12 tons of carbon dioxide per year from the atmosphere...",
        date: "January 14, 2025",
    },
    {
        title:
            "Aramco launches Saudi Arabia's first CO2 Direct Air Capture test unit",
        titleColor: "text-[#ffffff]",
        content:
            "Aramco, one of the world's leading integrated energy and chemicals companies, has launched the Kingdom's first CO2 Direct Air Capture (DAC) test unit, capable...",
        date: "March 10, 2025",
    },
];

// Pagination dots data
const paginationDots = [
    { active: true, className: "w-4 h-4 bg-[#83bd01] rounded-lg" },
    { active: false, className: "w-2 h-2 bg-[#ffffff] rounded opacity-50" },
    { active: false, className: "w-2 h-2 bg-[#ffffff] rounded opacity-50" },
    { active: false, className: "w-2 h-2 bg-[#ffffff] rounded opacity-50" },
    { active: false, className: "w-2 h-2 bg-[#ffffff] rounded opacity-50" },
];

export const NewsFeed = (): JSX.Element => {
    return (
        <section className="flex flex-col items-center gap-[27px] relative w-full flex-[0_0_auto]">
            <header className="relative w-full flex items-center">

                <Image src={`${process.env.NEXT_PUBLIC_BSP_NAME}/news-feed.svg`}
                    alt="news-feed"
                    width={100}
                    height={100}
                    className="w-[23px] h-[23px]" />

                <h2 className="ml-[11px] [font-family:'Ghawar-SmeiBold',Helvetica] font-bold text-[#ffffff] text-xl tracking-[-0.20px] leading-4 whitespace-nowrap">
                    News Classifier
                </h2>

                <div className={`h-px flex-grow ml-[11px] bg-no-repeat bg-cover`} style={{backgroundImage:`${process.env.NEXT_PUBLIC_BSP_NAME}/line-136-4.svg`}}></div>
            </header>

            <Card className="w-full border border-solid border-[#00a3e0] rounded-xl shadow-[3px_8px_30px_1px_#a8afb84c] [background:linear-gradient(180deg,rgba(30,58,113,1)_25%,rgba(0,128,189,1)_100%),linear-gradient(0deg,rgba(13,54,111,1)_0%,rgba(13,54,111,1)_100%)] bg-gradientblue-1">
                <CardContent className="p-[13px]">
                    <div className="flex items-center gap-6 px-4 py-0 relative w-full">
                        {newsArticles.map((article, index) => (
                            <React.Fragment key={index}>
                                <div className="flex-1">
                                    <div className="[font-family:'Ghawar-Bold',Helvetica] font-normal text-transparent text-xl tracking-[-0.40px] leading-5">
                                        <span
                                            className={`font-bold ${article.titleColor} tracking-[-0.08px] leading-[0.1px]`}
                                        >
                                            {article.title}
                                            <br />
                                        </span>

                                        <span className="leading-[30px] [font-family:'Ghawar-Regular',Helvetica] text-[#ffffff] text-base tracking-[-0.05px]">
                                            {article.content.substring(0, 50)}
                                        </span>

                                        <span className="leading-[22px] [font-family:'Ghawar-Regular',Helvetica] text-[#ffffff] text-base tracking-[-0.05px]">
                                            {article.content.substring(50)}
                                        </span>
                                    </div>

                                    <div className="mt-4 text-[#dadce2] text-sm tracking-[-0.28px] leading-[30px] [font-family:'Ghawar-Hefty',Helvetica] font-normal whitespace-nowrap">
                                        {article.date}
                                    </div>
                                </div>

                                {index < newsArticles.length - 1 && (
                                    <img
                                        className="w-px h-[81px]"
                                        alt="Line"
                                        src={`${process.env.NEXT_PUBLIC_BSP_NAME}/line-55.svg`}
                                    />
                                )}
                            </React.Fragment>
                        ))}

                        {/* Pagination dots */}
                        <div className="relative w-20 h-4 rotate-90">
                            <div className="inline-flex items-center gap-2 relative">
                                {paginationDots.map((dot, index) => (
                                    <div key={index} className={dot.className} />
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
};

export default NewsFeed