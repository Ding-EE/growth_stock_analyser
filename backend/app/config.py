import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    APP_NAME: str = "Growth Stock Analyzer & TradingAgents Committee"
    VERSION: str = "1.2.0"
    DEBUG: bool = True
    
    # AI Synthesis (Google Gemini)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = "gemini-3.8-flash"
    
    # Alerting (Free Discord Webhook)
    DISCORD_WEBHOOK_URL: str = os.getenv("DISCORD_WEBHOOK_URL", "")
    
    # Comprehensive US Watchlist (Top 30 Market Leaders & Growth Innovators)
    US_WATCHLIST: list[str] = [
        "AAPL", "NVDA", "MSFT", "AMZN", "GOOGL", "META", 
        "TSLA", "AVGO", "PLTR", "AMD", "CRWD", "NOW", "SNOW",
        "NFLX", "COST", "LLY", "JPM", "V", "UNH", "WMT",
        "QCOM", "TXN", "UBER", "ABNB", "PANW", "SMCI", "COIN",
        "ARM", "ASML", "CRM"
    ]
    
    # Comprehensive Bursa Malaysia Watchlist (KLCI 30 + Premier Tech, Growth & Dividend Leaders)
    BURSA_WATCHLIST: list[str] = [
        # Banking & Financial Services
        "1155.KL",  # Malayan Banking (Maybank)
        "1023.KL",  # CIMB Group
        "1295.KL",  # Public Bank
        "1066.KL",  # RHB Bank
        "1015.KL",  # AMMB Holdings
        "5819.KL",  # Hong Leong Bank
        
        # Technology & Semiconductor OSAT / Capital Equipment
        "0166.KL",  # Inari Amertron (Semiconductor OSAT)
        "0097.KL",  # ViTrox Corporation (Automated Optical Inspection)
        "0128.KL",  # Frontken Corporation (Semiconductor engineering)
        "0138.KL",  # Zetrix / MyEG Services (Digital tech / Blockchain / e-Gov)
        "0208.KL",  # Greatech Technology (Factory automation)
        "5292.KL",  # UWC Berhad (Precision engineering)
        "7204.KL",  # D&O Green Technologies (Automotive LED)
        
        # Infrastructure, Construction & Industrials
        "5398.KL",  # Gamuda (Infrastructure / Construction)
        "8869.KL",  # Press Metal Aluminium
        "5211.KL",  # Sunway Berhad
        "7277.KL",  # Dialog Group (Oil & Gas logistics)
        "3816.KL",  # MISC Berhad (Energy shipping)
        
        # Consumer, Retail & Plantations
        "7084.KL",  # QL Resources (Agro / Consumer foods)
        "5296.KL",  # MR D.I.Y. Group (Retail)
        "4707.KL",  # Nestlé Malaysia
        "5306.KL",  # Farm Fresh
        "4197.KL",  # Sime Darby
        "2445.KL",  # Kuala Lumpur Kepong (KLK)
        "1961.KL",  # IOI Corporation
        
        # Healthcare, Energy, Utilities & Aviation
        "5225.KL",  # IHH Healthcare
        "5878.KL",  # KPJ Healthcare
        "5099.KL",  # Capital A (AirAsia)
        "5183.KL",  # Petronas Chemicals
        "6033.KL",  # Petronas Gas
        "5681.KL",  # Petronas Dagangan
        "5347.KL",  # Tenaga Nasional (National Power)
        "6742.KL",  # YTL Power International
        "6888.KL",  # Axiata Group
        "6947.KL",  # CelcomDigi
        "4863.KL",  # Telekom Malaysia
        "5168.KL",  # Hartalega Holdings
        "7113.KL",  # Top Glove
    ]
    
    # Screening Defaults
    DEFAULT_MIN_REV_GROWTH: float = 15.0  # 15%
    DEFAULT_MIN_EPS_GROWTH: float = 15.0  # 15%
    DEFAULT_MAX_DEBT_TO_EQUITY: float = 2.0
    DEFAULT_MIN_ROE: float = 10.0         # 10%

settings = Settings()
