import React, { useState, useEffect, useRef } from 'react';

// --- SVG Icons ---
const UserIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const BotIcon = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m-2 6h-2M12 6V4m0 16v-2M8 8l1.414-1.414M14.586 14.586L16 16m-1.414 1.414L16 16m-5.414-1.414L8 8m1.414-1.414L8 8" />
        <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
);
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const PlusIcon = ({ className = "h-5 w-5 mr-2" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);
const ChatIcon = ({ className = "h-5 w-5 mr-2" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);
const LogoutIcon = ({ className = "h-5 w-5 mr-3" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);
const SettingsIcon = ({ className = "h-5 w-5 mr-3" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const EyeIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
const EyeOffIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
);
const SunIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const CopyIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);
const CheckIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);
const ThumbsUpIcon = ({ className = "h-5 w-5", filled = false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.97l-2.714 4.224a2 2 0 01-1.455.976H5a2 2 0 00-2 2v7a2 2 0 002 2h2m7-10h-2M7 20H5" />
    </svg>
);
const ThumbsDownIcon = ({ className = "h-5 w-5", filled = false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.738 3h4.017c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.085a2 2 0 001.736-.97l2.714-4.224a2 2 0 011.455-.976H19a2 2 0 002-2v-7a2 2 0 00-2-2h-2M7 4h2m7 10h2m-7-10V4" />
    </svg>
);
const DotsVerticalIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
);

// Icons for menu options
const ViewIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EditIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const DeleteIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const RenameIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

// --- Reusable Components ---
const AnimatedWallpaper = ({ theme }) => {
    const wallpaperBg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    return (
        <div className={`w-full h-full relative overflow-hidden ${wallpaperBg}`}>
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) translateX(10px) rotate(180deg); }
                    100% { transform: translateY(0px) translateX(0px) rotate(360deg); }
                }
                .shape {
                    position: absolute;
                    border-radius: 50%;
                    animation: float 15s ease-in-out infinite;
                }
            `}</style>
            <div className="shape bg-teal-500 opacity-20 w-48 h-48 top-1/4 left-1/4" style={{ animationDuration: '20s' }}></div>
            <div className="shape bg-teal-400 opacity-10 w-32 h-32 top-1/2 left-3/4" style={{ animationDuration: '25s', animationDelay: '5s' }}></div>
            <div className="shape bg-teal-600 opacity-10 w-64 h-64 top-3/4 left-1/3" style={{ animationDuration: '30s', animationDelay: '2s' }}></div>
            <div className="shape border border-teal-500 opacity-20 w-40 h-40 top-10 left-10" style={{ animationDuration: '18s', animationDelay: '7s' }}></div>
        </div>
    );
};

const OptionsMenu = ({ options, theme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200';
    const menuBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const hoverBg = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className={`p-1 rounded-full ${buttonBg} hover:${buttonBg}`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
            </button>
            {isOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg border ${menuBg} z-50`}>
                    <div className="py-1">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                onClick={(e) => { e.stopPropagation(); option.action(); setIsOpen(false); }}
                                className={`${option.isDestructive ? 'text-red-600' : ''} flex items-center w-full px-4 py-2 text-sm ${hoverBg}`}
                            >
                                {option.icon}
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ProfileDropdown = ({ username, onLogout, onProfileClick, onSettingsClick, theme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuBg = theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200';
    const itemHoverBg = theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100';
    const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
    const headerColor = theme === 'dark' ? 'text-gray-200 border-gray-600' : 'text-gray-800 border-gray-200';

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2">
                <div className={`w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold ring-2 ${theme === 'dark' ? 'ring-gray-400' : 'ring-gray-300'}`}>
                    {username.charAt(0).toUpperCase()}
                </div>
            </button>
            {isOpen && (
                <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-xl z-20 border ${menuBg}`}>
                    <div className="py-1">
                        <div className={`px-4 py-2 text-sm font-bold border-b ${headerColor}`}>{username}</div>
                        <button onClick={() => { onProfileClick(); setIsOpen(false); }} className={`w-full text-left flex items-center px-4 py-2 text-sm ${textColor} ${itemHoverBg}`}><UserIcon className="h-5 w-5 mr-3 text-gray-500"/> Profile</button>
                        <button onClick={() => { onSettingsClick(); setIsOpen(false); }} className={`w-full text-left flex items-center px-4 py-2 text-sm ${textColor} ${itemHoverBg}`}><SettingsIcon className="h-5 w-5 mr-3 text-gray-500"/> Settings</button>
                        <button onClick={onLogout} className={`w-full text-left flex items-center px-4 py-2 text-sm ${textColor} ${itemHoverBg}`}><LogoutIcon className="h-5 w-5 mr-3 text-gray-500"/> Logout</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Modals ---
const ProjectFormFields = ({ project, handleChange, theme, inputBg, labelColor }) => (
    <div className="space-y-4">
        <div>
            <label className={`block ${labelColor} text-sm font-medium mb-2`}>
                Project Name <span className="text-red-500">*</span>
            </label>
            <input 
                name="name" 
                value={project.name} 
                onChange={handleChange} 
                placeholder="Enter project name" 
                className={`w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-teal-500 ${inputBg}`} 
            />
        </div>
        <div>
            <label className={`block ${labelColor} text-sm font-medium mb-2`}>Project Description</label>
            <textarea 
                name="description" 
                value={project.description} 
                onChange={handleChange} 
                placeholder="Enter project description" 
                className={`w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-teal-500 ${inputBg}`} 
                rows="3"
            ></textarea>
        </div>
        <div>
            <label className={`block ${labelColor} text-sm font-medium mb-2`}>Project Type</label>
            <select 
                name="type" 
                value={project.type} 
                onChange={handleChange} 
                className={`w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-teal-500 ${inputBg}`}
            >
                <option value="">Please select</option>
                <option value="Web Portal">Web Portal</option>
                <option value="Mobile App">Mobile App</option>
                <option value="Both">Both</option>
                <option value="Backend Service">Backend Service</option>
                <option value="Other">Other</option>
            </select>
        </div>
        <div>
            <label className={`block ${labelColor} text-sm font-medium mb-2`}>Industry</label>
            <input 
                name="industry" 
                value={project.industry} 
                onChange={handleChange} 
                placeholder="e.g., FinTech, Healthcare, E-commerce" 
                className={`w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-teal-500 ${inputBg}`} 
            />
        </div>
    </div>
);

const NewProjectModal = ({ onSave, onCancel, theme }) => {
    const [project, setProject] = useState({ 
        name: '', 
        description: '', 
        type: '',
        industry: ''
    });
    const handleChange = (e) => setProject(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const modalBg = theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800';
    const inputBg = theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300';
    const labelColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-8 rounded-lg shadow-2xl w-full max-w-lg border ${modalBg}`}>
                <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
                <ProjectFormFields 
                    project={project}
                    handleChange={handleChange}
                    theme={theme}
                    inputBg={inputBg}
                    labelColor={labelColor}
                />
                <div className="flex justify-between mt-6">
                    <button onClick={onCancel} className={`${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} font-bold py-2 px-4 rounded-md`}>Cancel</button>
                    <button 
                        onClick={() => onSave({
                            name: project.name,
                            overview: project.description,
                            type: project.type || 'Not Specified',
                            industry: project.industry || 'Not Specified'
                        })} 
                        className={`bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md ${!project.name ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!project.name}
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProfileModal = ({ user, onCancel, onUpdate, theme }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState('**********');
    const [showPassword, setShowPassword] = useState(false);
    const modalBg = theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800';
    const inputBg = theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300';
    const labelColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-8 rounded-lg shadow-2xl w-full max-w-md border ${modalBg}`}>
                <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
                <div className="space-y-4">
                    <div>
                        <label className={`text-sm font-bold ${labelColor}`}>Username</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className={`mt-1 w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-teal-500 ${inputBg}`} />
                    </div>
                    <div>
                        <label className={`text-sm font-bold ${labelColor}`}>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={`mt-1 w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-teal-500 ${inputBg}`} />
                    </div>
                    <div>
                        <label className={`text-sm font-bold ${labelColor}`}>Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                value={password} 
                                disabled 
                                className={`mt-1 w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-teal-500 ${inputBg} ${theme === 'dark' ? 'opacity-70' : 'opacity-50'} cursor-not-allowed`} 
                            />
                            <button 
                                onClick={() => setShowPassword(!showPassword)} 
                                className={`absolute inset-y-0 right-0 px-3 flex items-center ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between mt-6">
                    <button onClick={onCancel} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                    <button onClick={() => onUpdate({ name, email })} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md">Update</button>
                </div>
            </div>
        </div>
    );
};

const SettingsModal = ({ onCancel, theme, onThemeChange, onDeleteAllChats, onDeleteAccount }) => {
    const modalBg = theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800';
    const itemBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';
    const labelColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
    const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-8 rounded-lg shadow-2xl w-full max-w-lg border ${modalBg}`}>
                <h2 className="text-2xl font-bold mb-6">Settings</h2>
                <div className="space-y-6">
                    <div>
                        <label className={`font-bold text-lg ${labelColor}`}>Theme</label>
                        <div className={`mt-2 p-1 rounded-lg flex space-x-1 ${itemBg}`}>
                            <button onClick={() => onThemeChange('light')} className={`w-full py-2 rounded-md ${theme === 'light' ? 'bg-teal-600 text-white' : ''}`}>Light</button>
                            <button onClick={() => onThemeChange('dark')} className={`w-full py-2 rounded-md ${theme === 'dark' ? 'bg-teal-600 text-white' : ''}`}>Dark</button>
                        </div>
                    </div>
                    <div>
                        <label className={`font-bold text-lg ${labelColor}`}>Data Management</label>
                        <div className="mt-2 space-y-3">
                           <div className="flex justify-between items-center">
                               <span className={textColor}>Delete All Chats</span>
                               <button onClick={onDeleteAllChats} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md">Delete</button>
                           </div>
                           <div className="flex justify-between items-center">
                               <span className={textColor}>Delete Account</span>
                               <button onClick={onDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md">Delete</button>
                           </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between mt-8">
                    <button onClick={onCancel} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-md">Cancel</button>
                    <button onClick={onCancel} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-md">Done</button>
                </div>
            </div>
        </div>
    );
};

const ConfirmationModal = ({ config, onCancel, theme }) => {
    if (!config) return null;
    const { title, message, onConfirm } = config;
    const modalBg = theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className={`p-8 rounded-lg shadow-2xl w-full max-w-sm border ${modalBg}`}>
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{message}</p>
                <div className="flex justify-between mt-6">
                    <button onClick={onCancel} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                    <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md">Confirm</button>
                </div>
            </div>
        </div>
    );
};

const RenameModal = ({ config, onCancel, onSave, theme }) => {
    const [newName, setNewName] = useState(config?.currentName || '');
    const modalBg = theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800';
    const inputBg = theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300';

    if (!config) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-8 rounded-lg shadow-2xl w-full max-w-lg border ${modalBg}`}>
                <h2 className="text-2xl font-bold mb-6">Rename {config.type}</h2>
                <input 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    placeholder={`Enter new ${config.type.toLowerCase()} name`} 
                    className={`w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-teal-500 ${inputBg} mb-6`} 
                />
                <div className="flex justify-between">
                    <button onClick={onCancel} className={`${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} font-bold py-2 px-4 rounded-md`}>Cancel</button>
                    <button 
                        onClick={() => onSave(config.type, config.id, newName)} 
                        className={`bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md ${!newName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!newName.trim()}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProjectDetailsModal = ({ project, onClose, onSave, theme }) => {
    const [editedProject, setEditedProject] = useState({ 
        name: project.name, 
        description: project.overview,
        type: project.type,
        industry: project.industry
    });
    const modalBg = theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800';
    const inputBg = theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300';
    const labelColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

    const handleChange = (e) => {
        setEditedProject(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = () => {
        onSave({
            ...project,
            name: editedProject.name,
            overview: editedProject.description,
            type: editedProject.type,
            industry: editedProject.industry
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-8 rounded-lg shadow-2xl w-full max-w-lg border ${modalBg}`}>
                <h2 className="text-2xl font-bold mb-6">Project Details</h2>
                <ProjectFormFields 
                    project={editedProject}
                    handleChange={handleChange}
                    theme={theme}
                    inputBg={inputBg}
                    labelColor={labelColor}
                />
                <div className="flex justify-between mt-6">
                    <button onClick={onClose} className={`${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} font-bold py-2 px-4 rounded-md`}>Cancel</button>
                    <button 
                        onClick={handleSave}
                        className={`bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md ${!editedProject.name ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!editedProject.name}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Page Components ---
const HomePage = ({ setPage, theme }) => (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} flex items-center justify-center h-screen font-sans text-center`}>
        <div className="p-8">
            <BotIcon className="h-24 w-24 mx-auto text-teal-500 mb-4" />
            <h1 className="text-5xl font-bold mb-2">Welcome to StoryCrafter Pro</h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xl mb-8`}>The professional's choice for crafting perfect user stories.</p>
            <button onClick={() => setPage('login')} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 text-lg">Get Started</button>
        </div>
    </div>
);

const AuthPageLayout = ({ children, theme }) => (
    <div className={`flex h-screen font-sans ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="hidden lg:block lg:w-1/2">
            <AnimatedWallpaper theme={theme} />
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
            {children}
        </div>
    </div>
);

const LoginPage = ({ setPage, onLogin, theme }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({ email: '', password: '' });

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleLogin = async () => {
        let newErrors = { email: '', password: '' };
        let isValid = true;

        if (!email || !validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address.';
            isValid = false;
        }
        
        if (!password) {
            newErrors.password = 'Password is required.';
            isValid = false;
        }

        if (!isValid) {
            setErrors(newErrors);
            return;
        }

        try {
            // First get the token
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const tokenResponse = await fetch('http://127.0.0.1:8000/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            if (!tokenResponse.ok) {
                setErrors({ email: 'Invalid email or password.', password: ' ' });
                return;
            }

            const tokenData = await tokenResponse.json();
            localStorage.setItem('token', tokenData.access_token);
            
            // Login successful
            onLogin({ name: email.split('@')[0], email: email, id: tokenData.user_id });
            setPage('dashboard');
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ email: 'An error occurred during login.', password: ' ' });
        }
    };
    const containerBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
    const inputBg = theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
    const labelColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

    return (
        <AuthPageLayout theme={theme}>
            <div className={`p-8 rounded-lg shadow-2xl w-full max-w-md border ${containerBg} ${textColor}`}>
                <h2 className="text-3xl font-bold text-center mb-6">Log In</h2>
                <div className="space-y-4">
                    <div>
                        <label className={`block text-sm font-bold mb-1 ${labelColor}`}>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-teal-500 ${inputBg}`} />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className={`block text-sm font-bold mb-1 ${labelColor}`}>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-teal-500 ${inputBg}`} />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                </div>
                <button onClick={handleLogin} className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-md transition duration-300">Log In</button>
                <p className={`text-center mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Don't have an account? <span onClick={() => setPage('signup')} className="text-teal-500 hover:underline cursor-pointer">Sign Up</span></p>
            </div>
        </AuthPageLayout>
    );
};

const SignUpPage = ({ setPage, setSignUpData, theme }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({ email: '', password: '' });
    
    const containerBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
    const inputBg = theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
    const labelColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = async () => {
        let newErrors = { email: '', password: '' };
        let isValid = true;

        if (!email || !validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address.';
            isValid = false;
        }
        
        if (!password || password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long.';
            isValid = false;
        }

        if (!isValid) {
            setErrors(newErrors);
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.detail === "Email already registered") {
                    setErrors({ email: 'Email is already registered.', password: '' });
                } else {
                    console.error('Signup error:', data);
                    setErrors({ email: data.detail || 'An error occurred during signup.', password: '' });
                }
                return;
            }

            // If signup successful, proceed with login
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const tokenResponse = await fetch('http://127.0.0.1:8000/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                },
                body: formData,
                credentials: 'include'
            });

            if (!tokenResponse.ok) {
                const tokenData = await tokenResponse.json();
                setErrors({ email: tokenData.detail || 'Error during login after signup.', password: '' });
                return;
            }

            const tokenData = await tokenResponse.json();
            localStorage.setItem('token', tokenData.access_token);
            
            setSignUpData({ email, password });
            setPage('enterName');
        } catch (error) {
            console.error('Signup/login error:', error);
            setErrors({ email: 'Network error or server is unavailable.', password: '' });
        }
    };

    return (
        <AuthPageLayout theme={theme}>
            <div className={`p-8 rounded-lg shadow-2xl w-full max-w-md border ${containerBg} ${textColor}`}>
                <h2 className="text-3xl font-bold text-center mb-6">Sign Up</h2>
                <div className="space-y-4">
                    <div>
                        <label className={`block text-sm font-bold mb-1 ${labelColor}`}>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-teal-500 ${inputBg}`} />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className={`block text-sm font-bold mb-1 ${labelColor}`}>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-teal-500 ${inputBg}`} />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                </div>
                <button onClick={handleSubmit} className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-md">Create Account</button>
                <p className={`text-center mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Already have an account? <span onClick={() => setPage('login')} className="text-teal-500 hover:underline cursor-pointer">Log In</span></p>
            </div>
        </AuthPageLayout>
    );
};

const EnterNamePage = ({ setPage, onLogin, signUpData, theme }) => {
    const [name, setName] = useState('');
    const containerBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
    const inputBg = theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';

    const handleNameSubmit = () => {
        if (name.trim()) { 
            onLogin({ name: name.trim(), email: signUpData.email }); 
            setPage('dashboard'); 
        }
    };
    return (
        <AuthPageLayout theme={theme}>
            <div className={`p-8 rounded-lg shadow-2xl w-full max-w-md text-center border ${containerBg} ${textColor}`}>
                <h2 className="text-3xl font-bold mb-6">One last step...</h2>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?" className={`w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-teal-500 ${inputBg}`} />
                <button onClick={handleNameSubmit} className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-md">Finish</button>
            </div>
        </AuthPageLayout>
    );
};

const DashboardPage = ({ user, projects, chats, onNewProject, onSelectProject, onLogout, onContinueWithoutProject, onSelectChat, onProfileClick, onSettingsClick, theme, onRename, onDelete }) => {
    const [selectedProject, setSelectedProject] = useState(null);

    const handleUpdateProject = (updatedProject) => {
        // Here you would typically make an API call to update the project
        onRename('project', updatedProject.id, updatedProject.name);
        setSelectedProject(null);
    };

    return (
        <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen font-sans`}>
            <header className={`p-4 flex justify-between items-center shadow-sm border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h1 className="text-2xl font-bold">StoryCrafter Pro</h1>
                <ProfileDropdown username={user.name} onLogout={onLogout} onProfileClick={onProfileClick} onSettingsClick={onSettingsClick} theme={theme} />
            </header>
            <main className="p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold">Dashboard</h2>
                    <div className="flex space-x-4">
                        <button onClick={onContinueWithoutProject} className={`${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} font-bold py-2 px-6 rounded-md`}>Continue without Project</button>
                        <button onClick={onNewProject} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-md flex items-center"><PlusIcon /> New Project</button>
                    </div>
                </div>

                {chats.length > 0 && (
                    <div className="mb-12">
                        <h3 className="text-2xl font-bold mb-4">Recent Chats</h3>
                        <div className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <ul className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                               {chats.map(chat => (
                                    <li key={chat.id} onClick={() => onSelectChat(chat.id)} className={`h-10 p-2 cursor-pointer transition-colors flex items-center justify-between ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                        <p className="flex items-center flex-grow min-w-0 h-full">
                                            <ChatIcon className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0 mr-2 w-4 h-4`}/> 
                                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{chat.title}</span>
                                        </p>
                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                            <OptionsMenu theme={theme} options={[
                                                { label: 'Rename', icon: <RenameIcon />, action: () => onRename('chat', chat.id, chat.title) },
                                                { label: 'Delete Chat', icon: <DeleteIcon />, action: () => onDelete('chat', chat.id), isDestructive: true }
                                            ]} />
                                        </div>
                                    </li>
                               ))}
                            </ul>
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="text-2xl font-bold mb-4">Your Projects</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((p) => (
                            <div key={p.id} onClick={() => onSelectProject(p)} className={`p-6 rounded-lg shadow-lg cursor-pointer transition-colors border relative ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                <div className="absolute top-4 right-4">
                                    <OptionsMenu theme={theme} options={[
                                        { label: 'View Details', icon: <ViewIcon />, action: () => setSelectedProject(p) },
                                        { label: 'Rename', icon: <EditIcon />, action: () => onRename('project', p.id, p.name) },
                                        { label: 'Delete Project', icon: <DeleteIcon />, action: () => onDelete('project', p.id), isDestructive: true }
                                    ]} />
                                </div>
                                <h3 className="text-xl font-bold mb-2 pr-8">{p.name}</h3>
                                <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {p.overview.length > 40 ? `${p.overview.substring(0, 40)}...` : p.overview}
                                </p>
                                <span className="text-xs bg-teal-500 text-white py-1 px-2 rounded-full">{p.type}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            {selectedProject && (
                <ProjectDetailsModal 
                    project={selectedProject} 
                    onClose={() => setSelectedProject(null)}
                    onSave={handleUpdateProject}
                    theme={theme}
                />
            )}
        </div>
    );
};

const formatSystemResponse = (text) => {
    // Split the text into sections
    const sections = text.split('\n').filter(line => line.trim() !== '');
    
    // Join sections with double line breaks
    return sections.join('\n\n');
};

const ChatInterface = ({ user, project, chats, activeChatId, onLogout, onBackToDashboard, onNewChat, onSelectChat, onCreateProject, onProfileClick, onSettingsClick, theme, onSendMessage, onFeedback }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState(null);
    const chatEndRef = useRef(null);
    const activeChat = chats.find(c => c.id === activeChatId);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChat?.messages]);

    const handleCopy = (text, messageId) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setCopiedMessageId(messageId);
            setTimeout(() => setCopiedMessageId(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        document.body.removeChild(textArea);
    };

    const handleLocalSendMessage = () => {
        if (!prompt.trim() || isLoading) return;
        
        onSendMessage(activeChatId, prompt);

        setPrompt('');
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 1500);
    };
    
    const sidebarBg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100';
    const mainBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-gray-200' : 'text-gray-800';
    const secondaryTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
    const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const inputBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';
    const botMsgBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';

    return (
        <div className={`flex h-screen font-sans ${textColor}`}>
            <aside className={`w-72 flex flex-col p-4 ${sidebarBg}`}>
                 <div className="flex items-center mb-6">
                    <button onClick={onBackToDashboard} className={`mr-3 p-1 rounded-full ${secondaryTextColor} hover:text-white hover:bg-gray-700`}>&larr;</button>
                    <h1 className="text-xl font-bold">StoryCrafter Pro</h1>
                </div>
                
                {project ? (
                    <>
                        <div className={`mb-4 p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <span className={`text-sm font-semibold uppercase ${secondaryTextColor}`}>Project</span>
                            <p className="font-bold text-lg">{project.name}</p>
                        </div>
                        <button onClick={onNewChat} className="w-full mb-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center"><PlusIcon /> New Chat</button>
                    </>
                ) : (
                     <>
                        <button onClick={onNewChat} className="w-full mb-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center"><PlusIcon /> New Chat</button>
                        <button onClick={onCreateProject} className={`w-full mb-4 font-bold py-2 px-4 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>Create Project</button>
                    </>
                )}

                <div className="flex-grow overflow-y-auto pr-2">
                    <h2 className={`text-sm font-semibold mb-2 uppercase ${secondaryTextColor}`}>Recent Chats</h2>
                     <nav>
                        <ul className="space-y-1">
                            {chats.map(chat => (
                                <li key={chat.id} onClick={() => onSelectChat(chat.id)} className={`h-10 flex items-center p-2 rounded-md cursor-pointer justify-between ${chat.id === activeChatId ? (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200') : `${secondaryTextColor} hover:bg-gray-700 hover:text-white`}`}>
                                    <div className="flex items-center min-w-0">
                                        <ChatIcon className="flex-shrink-0 mr-2 w-4 h-4" /> 
                                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">{chat.title}</span>
                                    </div>
                                    <OptionsMenu theme={theme} options={[
                                        { label: 'Rename', icon: <RenameIcon />, action: () => onRename('chat', chat.id, chat.title) },
                                        { label: 'Delete Chat', icon: <DeleteIcon />, action: () => onDelete('chat', chat.id), isDestructive: true }
                                    ]} />
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </aside>

            <main className={`flex-1 flex flex-col ${mainBg}`}>
                <div className={`p-3 flex justify-between items-center border-b ${borderColor}`}>
                    <div className="flex items-center">
                        <span className={`text-sm mr-2 ${secondaryTextColor}`}>Model:</span>
                        <select className={`border rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                            <option>Gemini Flash</option>
                        </select>
                    </div>
                    <ProfileDropdown username={user.name} onLogout={onLogout} onProfileClick={onProfileClick} onSettingsClick={onSettingsClick} theme={theme} />
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        {activeChat?.messages.map((msg, index) => (
                            <div key={msg.id || index} className="w-full mb-6">
                                <div className={`flex items-start ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                    {!msg.isUser && <div className={`rounded-full p-2 mr-4 ${botMsgBg}`}><BotIcon className="text-teal-500"/></div>}
                                    <div className={`p-4 rounded-lg max-w-2xl ${msg.isUser ? 'bg-teal-600 text-white rounded-br-none' : `${botMsgBg} rounded-bl-none`}`}>
                                        <div className="whitespace-pre-wrap">{msg.isUser ? msg.text : formatSystemResponse(msg.text)}</div>
                                    </div>
                                    {msg.isUser && <div className={`rounded-full p-2 ml-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}><UserIcon className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}/></div>}
                                </div>
                                {!msg.isUser && index > 0 && (
                                    <div className={`pl-16 pt-2 flex items-center space-x-4 ${secondaryTextColor}`}>
                                        <button onClick={() => handleCopy(msg.text, msg.id)} className={`flex items-center hover:text-teal-500`}>
                                            {copiedMessageId === msg.id ? (
                                                <>
                                                    <CheckIcon className="h-5 w-5 mr-1 text-green-500" />
                                                    <span className="text-sm">Copied!</span>
                                                </>
                                            ) : (
                                                <CopyIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                        <button onClick={() => onFeedback(activeChatId, msg.id, 'good')} className={`${msg.feedback === 'good' ? 'text-teal-500' : 'hover:text-teal-500'}`}><ThumbsUpIcon filled={msg.feedback === 'good'} /></button>
                                        <button onClick={() => onFeedback(activeChatId, msg.id, 'bad')} className={`${msg.feedback === 'bad' ? 'text-red-500' : 'hover:text-red-500'}`}><ThumbsDownIcon filled={msg.feedback === 'bad'} /></button>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                </div>

                <div className={`p-6 border-t ${borderColor}`}>
                    <div className="max-w-4xl mx-auto relative">
                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleLocalSendMessage()} placeholder="Enter a product requirement..." className={`w-full p-4 pr-16 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${inputBg}`} rows="1" disabled={isLoading} />
                        <button onClick={handleLocalSendMessage} disabled={isLoading || !prompt.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:bg-gray-500 transition-colors"><SendIcon /></button>
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- Main App Component (Router) ---
export default function App() {
    const [page, setPage] = useState('home');
    const [user, setUser] = useState(null);
    const [signUpData, setSignUpData] = useState(null);
    const [projects, setProjects] = useState([]);
    const [chats, setChats] = useState([]);
    const [activeProject, setActiveProject] = useState(null);
    const [activeChatId, setActiveChatId] = useState(null);
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [confirmationConfig, setConfirmationConfig] = useState(null);
    const [renameConfig, setRenameConfig] = useState(null);
    const [theme, setTheme] = useState('dark'); // 'light' or 'dark'

    useEffect(() => {
        // Check for stored token and fetch user data on app load
        const token = localStorage.getItem('token');
        if (token) {
            // TODO: Add endpoint to verify token and get user data
            // For now, we'll just check if the token exists
            const fetchUserChats = async () => {
                try {
                    const response = await fetch('http://127.0.0.1:8000/chats/', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const chatData = await response.json();
                        // Transform chat data into the format expected by the frontend
                        const transformedChats = await Promise.all(chatData.map(async (chat) => {
                            // Fetch messages for each chat
                            const messagesResponse = await fetch(`http://127.0.0.1:8000/chats/${chat.id}/messages/`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            if (messagesResponse.ok) {
                                const messages = await messagesResponse.json();
                                return {
                                    id: chat.id,
                                    title: chat.title,
                                    projectId: chat.project_id,
                                    messages: messages.map(msg => ({
                                        id: msg.id,
                                        text: msg.message,
                                        isUser: msg.is_user,
                                        timestamp: msg.created_at
                                    }))
                                };
                            }
                            return {
                                id: chat.id,
                                title: chat.title,
                                projectId: chat.project_id,
                                messages: []
                            };
                        }));
                        setChats(transformedChats);
                    }
                } catch (error) {
                    console.error('Error fetching chats:', error);
                }
            };

            if (user) {
                fetchUserChats();
            }
        }
    }, [user]);

    const handleFeedback = (chatId, messageId, feedbackType) => {
        setChats(chats.map(chat => {
            if (chat.id === chatId) {
                return {
                    ...chat,
                    messages: chat.messages.map(msg => {
                        if (msg.id === messageId) {
                            return { ...msg, feedback: msg.feedback === feedbackType ? null : feedbackType };
                        }
                        return msg;
                    })
                };
            }
            return chat;
        }));
    };

    const handleSendMessage = async (chatId, prompt) => {
        const userMessage = { id: Date.now(), text: prompt, isUser: true };
        let updatedChats = chats.map(chat => {
            if (chat.id === chatId) {
                return { ...chat, messages: [...chat.messages, userMessage] };
            }
            return chat;
        });
        setChats(updatedChats);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://127.0.0.1:8000/api/generate-story', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid
                    handleLogout();
                    return;
                }
                throw new Error('Failed to generate story');
            }

            const data = await response.json();
            
            // Since the backend creates a new chat automatically, we need to refresh the chats
            // to get the new chat with the messages
            const chatsResponse = await fetch('http://127.0.0.1:8000/chats/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (chatsResponse.ok) {
                const chatData = await chatsResponse.json();
                const transformedChats = await Promise.all(chatData.map(async (chat) => {
                    // Fetch messages for each chat
                    const messagesResponse = await fetch(`http://127.0.0.1:8000/chats/${chat.id}/messages/`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (messagesResponse.ok) {
                        const messages = await messagesResponse.json();
                        return {
                            id: chat.id,
                            title: chat.title,
                            projectId: chat.project_id,
                            messages: messages.map(msg => ({
                                id: msg.id,
                                text: msg.message,
                                isUser: msg.is_user,
                                timestamp: msg.created_at
                            }))
                        };
                    }
                    return {
                        id: chat.id,
                        title: chat.title,
                        projectId: chat.project_id,
                        messages: []
                    };
                }));
                setChats(transformedChats);
                
                // Set the active chat to the newest one (which should be the one with the new messages)
                if (transformedChats.length > 0) {
                    const newestChat = transformedChats[transformedChats.length - 1];
                    setActiveChatId(newestChat.id);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = { 
                id: Date.now() + 1, 
                text: "Sorry, I encountered an error while generating the story. Please try again.", 
                isUser: false, 
                feedback: null 
            };
            updatedChats = updatedChats.map(chat => {
                if (chat.id === chatId) {
                    return { ...chat, messages: [...chat.messages, errorMessage] };
                }
                return chat;
            });
            setChats(updatedChats);
        }
    };

    const createNewChat = async (isProjectChat = false) => {
        try {
            const token = localStorage.getItem('token');
            const chatData = {
                title: 'New Chat ' + (chats.length + 1),
                project_id: isProjectChat && activeProject ? activeProject.id : null
            };
            
            const response = await fetch('http://127.0.0.1:8000/chats/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(chatData)
            });
            
            if (response.ok) {
                const newChat = await response.json();
                const chatWithMessages = {
                    id: newChat.id,
                    title: newChat.title,
                    projectId: newChat.project_id,
                    messages: [{ 
                        id: Date.now() + 1, 
                        text: `Hello! Ready to craft some user stories. What's the requirement?`, 
                        isUser: false, 
                        feedback: null 
                    }]
                };
                setChats(prev => [...prev, chatWithMessages]);
                setActiveChatId(newChat.id);
                setPage('chat');
            }
        } catch (error) {
            console.error('Error creating new chat:', error);
        }
    };

    const handleLogin = (userData) => {
        setUser(userData);
        // The token is already stored in localStorage by the LoginPage component
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setActiveProject(null);
        setProjects([]);
        setChats([]);
        setPage('home');
    };

    const handleSaveProject = async (projectData) => {
        const newProject = { ...projectData, id: Date.now() };
        setProjects(prev => [...prev, newProject]);
        setShowNewProjectModal(false);
        setActiveProject(newProject);
        
        const currentChat = chats.find(c => c.id === activeChatId);
        if (currentChat && !currentChat.projectId) {
            setChats(chats.map(c => c.id === activeChatId ? { ...c, projectId: newProject.id, title: `${newProject.name} - Chat 1` } : c));
        } else {
            await createNewChat(true);
        }
        setPage('chat');
    };
    const handleSelectProject = async (project) => {
        setActiveProject(project);
        const projectChat = chats.find(c => c.projectId === project.id);
        if (projectChat) {
            setActiveChatId(projectChat.id);
        } else {
            await createNewChat(true);
        }
        setPage('chat');
    };
    const handleContinueWithoutProject = async () => {
        setActiveProject(null);
        await createNewChat(false);
    };
    const handleSelectChat = (chatId) => {
        const selectedChat = chats.find(c => c.id === chatId);
        if (selectedChat.projectId) {
            setActiveProject(projects.find(p => p.id === selectedChat.projectId));
        } else {
            setActiveProject(null);
        }
        setActiveChatId(chatId);
        setPage('chat');
    };
    const handleUpdateUser = (updatedUser) => {
        setUser(updatedUser);
        setShowProfileModal(false);
    };

    const handleDeleteAllChats = () => {
        setConfirmationConfig({
            title: 'Delete All Chats',
            message: 'Are you sure you want to delete all your chat history? This action cannot be undone.',
            onConfirm: () => {
                setChats([]);
                setConfirmationConfig(null);
                setShowSettingsModal(false);
            }
        });
    };

    const handleDeleteAccount = () => {
        setConfirmationConfig({
            title: 'Delete Account',
            message: 'Are you sure you want to permanently delete your account and all associated data?',
            onConfirm: () => {
                handleLogout();
                setConfirmationConfig(null);
                setShowSettingsModal(false);
            }
        });
    };

    const handleRename = (type, id, currentName) => {
        setRenameConfig({ type, id, currentName });
    };

    const handleSaveRename = (newName) => {
        if (renameConfig.type === 'chat') {
            setChats(chats.map(chat => chat.id === renameConfig.id ? { ...chat, title: newName } : chat));
        } else if (renameConfig.type === 'project') {
            setProjects(projects.map(p => p.id === renameConfig.id ? { ...p, name: newName } : p));
        }
        setRenameConfig(null);
    };

    const handleDelete = (type, id) => {
        if (type === 'chat') {
            setConfirmationConfig({
                title: 'Delete Chat',
                message: 'Are you sure you want to delete this chat?',
                onConfirm: () => {
                    setChats(chats.filter(c => c.id !== id));
                    setConfirmationConfig(null);
                }
            });
        } else if (type === 'project') {
            setConfirmationConfig({
                title: 'Delete Project',
                message: 'Are you sure you want to delete this project and all its chats?',
                onConfirm: () => {
                    setProjects(projects.filter(p => p.id !== id));
                    setChats(chats.filter(c => c.projectId !== id));
                    setConfirmationConfig(null);
                }
            });
        }
    };

    const renderPage = () => {
        switch (page) {
            case 'login': return <LoginPage setPage={setPage} onLogin={handleLogin} theme={theme} />;
            case 'signup': return <SignUpPage setPage={setPage} setSignUpData={setSignUpData} theme={theme} />;
            case 'enterName': return <EnterNamePage setPage={setPage} onLogin={handleLogin} signUpData={signUpData} theme={theme} />;
            case 'dashboard': return <DashboardPage user={user} projects={projects} chats={chats.filter(c => !c.projectId)} onNewProject={() => setShowNewProjectModal(true)} onSelectProject={handleSelectProject} onLogout={handleLogout} onContinueWithoutProject={handleContinueWithoutProject} onSelectChat={handleSelectChat} onProfileClick={() => setShowProfileModal(true)} onSettingsClick={() => setShowSettingsModal(true)} theme={theme} onRename={handleRename} onDelete={handleDelete} />;
            case 'chat': return <ChatInterface user={user} project={activeProject} chats={activeProject ? chats.filter(c => c.projectId === activeProject.id) : chats.filter(c => !c.projectId)} activeChatId={activeChatId} onLogout={handleLogout} onBackToDashboard={() => setPage('dashboard')} onNewChat={() => createNewChat(!!activeProject)} onSelectChat={(id) => setActiveChatId(id)} onCreateProject={() => setShowNewProjectModal(true)} onProfileClick={() => setShowProfileModal(true)} onSettingsClick={() => setShowSettingsModal(true)} theme={theme} onSendMessage={handleSendMessage} onFeedback={handleFeedback} />;
            case 'home':
            default: return <HomePage setPage={setPage} theme={theme} />;
        }
    };

    return (
        <div className={theme}>
            {renderPage()}
            {showNewProjectModal && <NewProjectModal onSave={handleSaveProject} onCancel={() => setShowNewProjectModal(false)} theme={theme} />}
            {showProfileModal && <ProfileModal user={user} onCancel={() => setShowProfileModal(false)} onUpdate={handleUpdateUser} theme={theme} />}
            {showSettingsModal && <SettingsModal onCancel={() => setShowSettingsModal(false)} theme={theme} onThemeChange={setTheme} onDeleteAllChats={handleDeleteAllChats} onDeleteAccount={handleDeleteAccount} />}
            <ConfirmationModal config={confirmationConfig} onCancel={() => setConfirmationConfig(null)} theme={theme} />
            <RenameModal config={renameConfig} onCancel={() => setRenameConfig(null)} onSave={handleSaveRename} theme={theme} />
        </div>
    );
}
