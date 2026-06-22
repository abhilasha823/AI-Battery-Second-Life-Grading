from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class BatteryPrediction(Base):
    __tablename__ = "battery_predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    battery_id: Mapped[str] = mapped_column(String(100), index=True)

    voltage: Mapped[float] = mapped_column(Float)
    current: Mapped[float] = mapped_column(Float)
    temperature: Mapped[float] = mapped_column(Float)
    cycle_count: Mapped[int] = mapped_column(Integer)
    capacity: Mapped[float] = mapped_column(Float)

    soh: Mapped[float] = mapped_column(Float)

    grade: Mapped[str] = mapped_column(String(1))
    recommendation: Mapped[str] = mapped_column(String(20))

    risk_level: Mapped[str] = mapped_column(
       String(20),
       default="Low"
    )

    confidence: Mapped[float] = mapped_column(
      Float,
      default=0
    )

    # NEW FIELDS
    passport_id: Mapped[str] = mapped_column(String(100), nullable=True)

    rul_years: Mapped[float] = mapped_column(Float, default=0)

    residual_value: Mapped[float] = mapped_column(Float, default=0)

    co2_saved: Mapped[float] = mapped_column(Float, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )


    @property
    def predicted_soh(self) -> float:
        return self.soh