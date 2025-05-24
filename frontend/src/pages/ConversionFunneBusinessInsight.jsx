import { ArrowLeftIcon, Eye, MousePointerClick, TrendingDown, Lightbulb, Rocket } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../store/useProductStore";
import { useEffect, useRef } from 'react';
import { createLogs } from '../funcs/essentialFuncs';

const ConversionFunnelLearnMore = () => {
    const { resetFormData } = useProductStore();
    const navigate = useNavigate();
    const pageLoadedRef = useRef(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        const pageLoaded = ()=>{
            if(localStorage.getItem("passkey")){
                if(pageLoadedRef.current) return;
                const passkeyName = localStorage.getItem("passkeyName");
                createLogs("Accessed", `${passkeyName} entered the Conversion Funnel Learn More Page`)
                pageLoadedRef.current = true;
            }
        };
        pageLoaded();
        return ()=>{}
    }, []);
    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <button
                onClick={() => {
                    resetFormData();
                    navigate(-1);
                }}
                className="btn btn-ghost mb-8"
            >
                <ArrowLeftIcon className="size-5 mr-2" />
                Back to Analytics
            </button>
            <div className="w-full h-full bg-base-200/60 mx-auto p-1 space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Business Insight – Conversion Funnel Analysis
                    </h1>
                    <div className="divider w-1/2 mx-auto"></div>
                </div>

                <div className="space-y-4">
                    {/* Stage 1 Accordion */}
                    <div className="collapse collapse-arrow bg-base-100 shadow-lg border border-primary/20 hover:border-primary/40 transition-all">
                        <input type="radio" name="conver-fun" defaultChecked />
                        <div className="collapse-title text-xl font-semibold flex items-center gap-3">
                            <Eye className="w-6 h-6 text-primary" />
                            High Impressions vs. Low Clicks
                            <div className="badge badge-primary badge-lg ml-auto text-nowrap">Stage 1</div>
                        </div>
                        <div className="collapse-content">
                            <p className="mb-4 text-lg leading-relaxed text-base-content">
                                A large number of impressions combined with relatively low clicks suggests that while your product is getting noticed,
                                the call-to-action or initial messaging isn’t compelling enough to drive further engagement.
                                This may indicate a need to refine ad copy, visuals, or targeting strategies.
                            </p>
                        </div>
                    </div>

                    {/* Stage 2 Accordion */}
                    <div className="collapse collapse-arrow bg-base-100 shadow-lg border border-secondary/20 hover:border-secondary/40 transition-all">
                        <input type="radio" name="conver-fun" />
                        <div className="collapse-title text-xl font-semibold flex items-center gap-3">
                            <MousePointerClick className="w-6 h-6 text-secondary" />
                            High Clicks but Low Purchases
                            <div className="badge badge-secondary badge-lg ml-auto text-nowrap">Stage 2</div>
                        </div>
                        <div className="collapse-content">
                            <p className="mb-4 text-lg leading-relaxed text-base-content">
                                If many users click through but few complete a purchase, this signals a conversion bottleneck—perhaps due to poor product
                                presentation in the product or item page and/or pricing strategy. Optimizing these areas could improve your overall conversion rate.
                            </p>
                        </div>
                    </div>

                    {/* Stage 3 Accordion */}
                    <div className="collapse collapse-arrow bg-base-100 shadow-lg border border-accent/20 hover:border-accent/40 transition-all">
                        <input type="radio" name="conver-fun" />
                        <div className="collapse-title text-xl font-semibold flex items-center gap-3">
                            <TrendingDown className="size-6 text-accent" />
                            Drop-Off Percentages
                            <div className="badge badge-accent badge-lg ml-auto text-nowrap">Insight</div>
                        </div>
                        <div className="collapse-content">
                            <p className="mb-4 text-lg leading-relaxed text-base-content">
                                The percentage annotations (both conversion and drop-off rates) on the funnel provide immediate diagnostic insight.
                                A steep drop-off between stages highlights the exact transition that needs attention, whether it’s generating interest
                                or closing the sale.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actionable Takeaways */}
                <div className="bg-gradient-to-br from-primary/10 to-accent/5 p-8 rounded-box border border-primary/20 relative group">
                    <div className="absolute -top-3 -right-3 bg-primary/10 p-2 rounded-full">
                        <Rocket className="w-8 h-8 text-primary/80" />
                    </div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <Lightbulb className="w-8 h-8 text-base-content" />
                        Actionable Takeaway
                        <div className="badge badge-lg badge-primary text-nowrap">Pro Tip</div>
                    </h2>
                    <div className="space-y-4 text-lg">
                        <p className="leading-relaxed">
                            Use the funnel data to strategically focus your efforts. If you’re seeing a significant drop-off at the click stage,
                            consider improving your product presentation or strengthening your call-to-action. Conversely, if the gap between clicks
                            and purchases is wide, it might be time to re-evaluate pricing and incentives.
                        </p>
                        <p className="leading-relaxed font-medium">
                            By analyzing these cumulative values and conversion percentages, you can not only track the effectiveness of your current
                            marketing efforts but also make data-driven decisions to optimize the customer journey, ultimately boosting revenue and user
                            satisfaction.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default ConversionFunnelLearnMore;