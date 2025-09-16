import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GameGuide = () => {
  const [openSection, setOpenSection] = useState('overview');
  const navigate = useNavigate();

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Address copied to clipboard!');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Address copied to clipboard!');
    }
  };

  const handlePlayNow = () => {
    navigate('/game/survival');
  };

  const sections = [
    {
      id: 'overview',
      title: 'Game Overview',
      icon: '🎮',
      content: (
        <div className="space-y-3">
          <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/20">
            <h4 className="font-semibold text-blue-200 mb-2 text-sm">Recommended Screen</h4>
            <p className="text-gray-300 text-sm">This game is best played in <strong className="text-white">mobile vertical screen view</strong>.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2 text-sm">Main Character</h4>
            <p className="text-gray-300 text-sm">Join <strong className="text-purple-300">Dico</strong>, the main character, and defeat monsters to level up!</p>
          </div>
        </div>
      )
    },
    {
      id: 'gameplay',
      title: 'How to Play',
      icon: '🕹️',
      content: (
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-green-400 text-sm">•</span>
            <p className="text-gray-300 text-sm">Your character automatically attacks the nearest enemy.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-400 text-sm">•</span>
            <p className="text-gray-300 text-sm">Avoid monsters while defeating them to gain dropped EXP.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-400 text-sm">•</span>
            <p className="text-gray-300 text-sm">Collect EXP to level up and grow stronger.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-400 text-sm">⚡</span>
            <p className="text-gray-300 text-sm">When leveling up, <strong className="text-yellow-300">10% of your lost HP is restored</strong>.</p>
          </div>
        </div>
      )
    },
    {
      id: 'controls',
      title: 'Controls',
      icon: '🎯',
      content: (
        <div className="space-y-3">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <h4 className="font-semibold text-white mb-2 text-sm">Control Options</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs">🕹️</span>
                <span className="text-gray-300 text-sm">Joystick Control</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs">⬆️</span>
                <span className="text-gray-300 text-sm">Arrow Keys</span>
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-xs">Control positions can be adjusted in the game settings.</p>
        </div>
      )
    },
    {
      id: 'scoring',
      title: 'Leaderboard & Scoring',
      icon: '🏆',
      content: (
        <div className="space-y-3">
          <div className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/20">
            <h4 className="font-semibold text-yellow-200 mb-2 text-sm">Scoring System</h4>
            <p className="text-gray-300 text-sm">The "Top Score" leaderboard is based on <strong className="text-white">Score</strong>.</p>
            <p className="text-gray-300 text-sm mt-1">Score is calculated from both <strong className="text-green-300">Kills</strong> and <strong className="text-blue-300">Level</strong>.</p>
          </div>
        </div>
      )
    },
    {
      id: 'rewards',
      title: 'Rewards',
      icon: '💰',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 p-3 rounded-lg border border-yellow-500/20">
            <h4 className="font-semibold text-yellow-200 mb-2 text-sm">Top Score (700,000 KSTA Total)</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-yellow-300 font-bold">1st:</span>
                <span className="text-white">120,000 KSTA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">2nd:</span>
                <span className="text-white">80,000 KSTA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-400">3rd:</span>
                <span className="text-white">60,000 KSTA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">4th–5th:</span>
                <span className="text-white">35,000 KSTA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">6th–10th:</span>
                <span className="text-white">25,000 KSTA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">11th–20th:</span>
                <span className="text-white">24,500 KSTA</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-3 rounded-lg border border-blue-500/20">
            <h4 className="font-semibold text-blue-200 mb-2 text-sm">Most Play (300,000 KSTA Total)</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-blue-300 font-bold">1st:</span>
                <span className="text-white">35,000 KSTA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">2nd:</span>
                <span className="text-white">25,000 KSTA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">3rd:</span>
                <span className="text-white">20,000 KSTA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">4th–10th:</span>
                <span className="text-white">15,000 KSTA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">11th–20th:</span>
                <span className="text-white">11,500 KSTA</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tickets',
      title: 'Tickets & Access',
      icon: '🎫',
      content: (
        <div className="space-y-3">
          <div className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/20">
            <h4 className="font-semibold text-yellow-200 mb-2 text-sm">Important Information Regarding Deposit</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
              <li>Please transfer the exact amount. (Deposits less than the ticket price will not be processed.)</li>
              <li>Incorrect transfers will be refunded collectively after the 2-week FESTA period.</li>
            </ul>
          </div>

          <div className="bg-green-900/20 p-3 rounded-lg border border-green-500/20">
            <h4 className="font-semibold text-green-200 mb-1 text-sm">Free Play</h4>
            <p className="text-gray-300 text-sm">Test Play: <strong className="text-green-300">Free</strong></p>
          </div>

          <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/20">
            <h4 className="font-semibold text-purple-200 mb-2 text-sm">Paid Tickets</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">1 Play Pass:</span>
                <span className="text-white font-semibold">500 KSTA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">1 Day Pass:</span>
                <span className="text-white font-semibold">2,000 KSTA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">1 Week Pass:</span>
                <span className="text-white font-semibold">10,000 KSTA</span>
              </div>
            </div>
          </div>

          <div className="bg-red-900/20 p-3 rounded-lg border border-red-500/20">
            <h4 className="font-semibold text-red-200 mb-1 text-sm">Purchase Method</h4>
            <p className="text-gray-300 text-sm mb-2">Ticket purchase is automatic when KSTA is sent to:</p>
            <code
              className="block p-2 bg-black/50 rounded text-red-300 font-mono text-xs break-all cursor-pointer hover:bg-black/70 transition-colors"
              onClick={() => copyToClipboard('0xC13B4833D0126Ed7E788e04E41b6657aDfd6F97D')}
              title="Click to copy address"
            >
              Click Here: 0xC13B4833D0126Ed7E788e04E41b6657aDfd6F97D
            </code>
          </div>
        </div>
      )
    },
    {
      id: 'notice',
      title: 'Notice',
      icon: '📝',
      content: (
        <div className="space-y-3">
          <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/20">
            <h4 className="font-semibold text-blue-200 mb-2 text-sm">Samsung Internet Browser Users</h4>
            <p className="text-gray-300 text-sm">
              For users who use the <strong className="text-white">Samsung Internet browser</strong> with the
              <strong className="text-blue-300"> "AdBlock for Samsung Internet"</strong> app, please be sure to add
              <strong className="text-yellow-300"> game.kstadium.io</strong> as an allowed website.
            </p>
          </div>
        </div>
      )
    },
    /* {
      id: 'verification',
      title: 'Checking Tickets',
      icon: '🔍',
      content: (
        <div className="space-y-3">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <p className="text-gray-300 text-sm">You can verify your ticket information in the <strong className="text-blue-300">designated page</strong>.</p>
            <p className="text-gray-500 text-xs mt-1">(Image upload coming soon)</p>
          </div>
        </div>
      )
    } */
  ];

  return (
    <div className="w-screen h-screen overflow-y-auto bg-gray-900">
      <div className="px-4 py-6 pb-20">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            K STADIUM Survival Beta
          </h2>
          <p className="text-gray-400 text-sm">Complete Game Guide</p>
        </div>

        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.id} className="bg-gray-800/50 rounded-lg border border-gray-700">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-3 text-left bg-black flex items-center justify-between hover:bg-gray-700/30 transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{section.icon}</span>
                  <h3 className="text-base font-semibold text-white">{section.title}</h3>
                </div>
                <span className={`text-gray-400 transition-transform text-sm ${openSection === section.id ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {openSection === section.id && (
                <div className="px-3 pb-3">
                  <div className="border-t border-gray-600 pt-3">
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/20">
          <h3 className="text-lg font-semibold text-white mb-2">Ready to Play?</h3>
          <p className="text-gray-300 mb-4 text-sm">Start your survival journey with Dico and climb the leaderboards!</p>
          <button
            onClick={handlePlayNow}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
          >
            Play Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameGuide;