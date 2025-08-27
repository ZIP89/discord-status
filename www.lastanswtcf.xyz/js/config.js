(function() {
    'use strict';
    const _0x4b2c = [
        'aHR0cHM6Ly9hcGkubGFueWFyZC5yZXN0L3YxL3VzZXJzLw==',
        'aHR0cDovL3VzMi5ib3QtaG9zdGluZy5uZXQ6MjAyMDIvYXZhdGFyaGlzdG9yeS8=',
        'MTE3MDEwOTEzOTk4OTU2MTQ2NA=='
    ];
    
    function _0x5d3a(str) {
        return atob(str);
    }
    
    const ApiConfig = {
        getUserId: function() {
            return _0x5d3a(_0x4b2c[2]);
        },
        getDiscordApi: function() {
            return _0x5d3a(_0x4b2c[0]) + this.getUserId();
        },
        getAvatarApi: function() {
            const baseUrl = _0x5d3a(_0x4b2c[1]) + this.getUserId();
            return `https://api.allorigins.win/get?url=${encodeURIComponent(baseUrl)}`;
        },
        
        safeFetch: async function(url, options = {}) {
            const maxRetries = 3;
            let lastError;
            
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    const response = await fetch(url, {
                        ...options,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (compatible)',
                            'Accept': 'application/json',
                            ...options.headers
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    if (data.contents && url.includes('allorigins.win')) {
                        return JSON.parse(data.contents);
                    }
                    
                    return data;
                } catch (error) {
                    lastError = error;
                    console.warn(`Attempt ${attempt} failed: ${error.message}`);
                    
                    if (attempt < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
                    }
                }
            }
            
            throw lastError;
        }
    };
    
    const _0xApiName = btoa('API').replace(/=/g, '');
    window._API = ApiConfig;
    
    let devtools = {
        open: false,
        orientation: null
    };
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > 160 || window.outerWidth - window.innerWidth > 160) {
            if (!devtools.open) {
                devtools.open = true;
                console.clear();
                console.log('%csup!', 'color: red; font-size: 20px; font-weight: bold;');
                console.log('%cby lastanswtcf', 'color: orange; font-size: 14px;');
            }
        } else {
            devtools.open = false;
        }
    }, 500);
    
    console.log('%csup!', 'color: red; font-size: 24px; font-weight: bold; background: yellow; padding: 5px;');
    console.log('%cby lastanswtcf', 'color: red; font-size: 14px;');
    
    setTimeout(() => {
        try {
            const scripts = document.querySelectorAll('script[src*="config"]');
            scripts.forEach(script => {
            });
        } catch(e) {}
    }, 2000);
})();
