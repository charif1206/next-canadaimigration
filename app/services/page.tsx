'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';

interface Service {
    icon: React.ReactNode;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    requiresEquivalenceValidation?: boolean;
}

const serviceData: Service[] = [
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
        title: "Équivalence de diplôme",
        description: "Nous vous guidons dans la demande d'équivalence auprès des organismes reconnus (WES, IQAS, etc.).",
        buttonText: "Remplir le formulaire",
        buttonLink: 'forms/equivalence',
        requiresEquivalenceValidation: false,
    },

    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>,
        title: "Préparation TCF Canada",
        description: "Accédez à des simulateurs identiques à l'examen officiel et atteignez le niveau C1/C2 grâce à nos formations ciblées.",
        buttonText: "Découvrir la formation",
        buttonLink: 'https://tcfcanada-preparation.com/?fbclid=IwY2xjawOzuvZleHRuA2FlbQIxMQBzcnRjBmFwcF9pZAEwAAEeEKTCnjGb_LrU70QlkhGWbkpCiiqwWbcWLSFPBZhP3qtXzrLYIJfDfx3coyc_aem_3F412HCid8NbZ609yMtUWQ',
        requiresEquivalenceValidation: true,
    },
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        title: "Suivi CSQ",
        description: "Accompagnement complet pour votre dossier Québec — dépôt, suivi et mise à jour.",
        buttonText: "Suivre mon dossier CSQ",
        buttonLink: 'forms/residence',
        requiresEquivalenceValidation: true,
    },

];

const ServiceCard: React.FC<Service> = ({ icon, title, description, buttonText, buttonLink }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
            <div className="mb-4">{icon}</div>
            <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2">{title}</h3>
            <p className="text-sm sm:text-base text-slate-600 mb-6 flex-grow">{description}</p>
            <Link
                href={buttonLink}
                className="mt-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 sm:py-3 px-6 rounded-full transition duration-300 min-h-[44px] inline-flex items-center justify-center text-sm sm:text-base"
            >
                {buttonText}
            </Link>
        </div>
    );
};

const ServicesPage: React.FC = () => {
    const { client, refreshAuth } = useAuth();
    
    // Auto-refresh profile data when page loads to get latest status
    useEffect(() => {
        const autoRefresh = async () => {
            if (refreshAuth) {
                await refreshAuth();
                console.log('✅ Services page - Profile data refreshed');
            }
        };
        autoRefresh();
    }, [refreshAuth]);
    
    const isEquivalenceValidated = (client as any)?.equivalenceStatus === 'validated';
    
    // Debug: Log the client data and equivalence status
    console.log('🔍 Services Page - Client:', client);
    console.log('🔍 Equivalence Status:', (client as any)?.equivalenceStatus);
    console.log('🔍 Is Validated:', isEquivalenceValidated);
    
    // Filter services based on equivalence validation
    const visibleServices = serviceData.filter(service => 
        !service.requiresEquivalenceValidation || isEquivalenceValidated
    );
    
    console.log('🔍 Visible Services Count:', visibleServices.length);
    
    return (
        <div className="py-12 sm:py-16 md:py-20 bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 sm:mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900">Nos services d&apos;accompagnement</h1>
                    <p className="text-base sm:text-lg text-slate-600 mt-2">Un soutien complet pour chaque étape de votre projet.</p>
                    {client && (
                        <p className="text-xs text-gray-500 mt-2">
                            Statut équivalence: {(client as any)?.equivalenceStatus || 'non défini'}
                        </p>
                    )}
                </div>
                
                {!isEquivalenceValidated && client && (
                    <div className="max-w-2xl mx-auto mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                        <p className="text-blue-800 font-medium">🔒 Services supplémentaires verrouillés</p>
                        <p className="text-sm text-blue-600 mt-1">
                            Complétez et faites valider votre formulaire d'équivalence pour débloquer tous nos services
                        </p>
                    </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                    {visibleServices.map((service, index) => (
                        <ServiceCard key={index} {...service} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServicesPage;