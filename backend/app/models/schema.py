import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, Integer, BigInteger, Numeric,
    ForeignKey, Text, Enum, UniqueConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    allow_real_trading = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    accounts = relationship("BrokerAccount", back_populates="user", cascade="all, delete-orphan")
    consents = relationship("UserConsent", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class UserConsent(Base):
    __tablename__ = "user_consents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    consent_type = Column(String(100), nullable=False)  # RISK_DISCLOSURE, LIVE_TRADING_ACKNOWLEDGEMENT
    version = Column(String(20), nullable=False)
    ip_address = Column(String(45), nullable=True)
    accepted_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="consents")

class BrokerAccount(Base):
    __tablename__ = "broker_accounts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    account_name = Column(String(120), nullable=False)
    login = Column(BigInteger, nullable=False)
    server = Column(String(100), nullable=False)
    environment = Column(Enum("PAPER", "DEMO", "LIVE", name="env_enum"), nullable=False, default="DEMO")
    status = Column(Enum("DISCONNECTED", "CONNECTING", "CONNECTED", "ERROR", name="acc_status_enum"), default="DISCONNECTED")
    currency = Column(String(10), default="USD")
    balance = Column(Numeric(14, 2), default=0.0)
    equity = Column(Numeric(14, 2), default=0.0)
    margin = Column(Numeric(14, 2), default=0.0)
    free_margin = Column(Numeric(14, 2), default=0.0)
    leverage = Column(Integer, default=100)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True)

    __table_args__ = (
        UniqueConstraint("user_id", "login", "server", name="uq_user_login_server"),
    )

    user = relationship("User", back_populates="accounts")
    credential = relationship("EncryptedBrokerCredential", uselist=False, back_populates="account", cascade="all, delete-orphan")
    configuration = relationship("RobotConfiguration", uselist=False, back_populates="account", cascade="all, delete-orphan")
    instance = relationship("RobotInstance", uselist=False, back_populates="account", cascade="all, delete-orphan")

class EncryptedBrokerCredential(Base):
    __tablename__ = "encrypted_broker_credentials"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("broker_accounts.id", ondelete="CASCADE"), unique=True, nullable=False)
    encrypted_password = Column(Text, nullable=False)  # Base64 ciphertext
    nonce = Column(Text, nullable=False)               # Base64 IV
    key_version = Column(Integer, default=1, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    account = relationship("BrokerAccount", back_populates="credential")

class RobotConfiguration(Base):
    __tablename__ = "robot_configurations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("broker_accounts.id", ondelete="CASCADE"), unique=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    selected_symbols = Column(JSONB, default=list)  # [] = all symbols
    fixed_lot = Column(Numeric(6, 2), default=0.1)
    stop_loss_points = Column(Integer, default=250)
    take_profit_points = Column(Integer, default=500)
    entry_score_threshold = Column(Integer, default=65)
    reversal_threshold = Column(Integer, default=75)
    max_open_positions = Column(Integer, default=3)
    daily_loss_limit = Column(Numeric(12, 2), default=500.0)
    max_consecutive_losses = Column(Integer, default=3)
    correlation_limit = Column(Numeric(4, 2), default=0.7)
    utc_session_start = Column(String(5), default="07:00")
    utc_session_end = Column(String(5), default="19:00")
    breakeven_trigger_points = Column(Integer, default=150)
    trailing_stop_points = Column(Integer, default=100)
    signal_confirmation_minutes = Column(Integer, default=2)
    entry_cooldown_minutes = Column(Integer, default=15)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    account = relationship("BrokerAccount", back_populates="configuration")

class RobotInstance(Base):
    __tablename__ = "robot_instances"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("broker_accounts.id", ondelete="CASCADE"), unique=True, nullable=False)
    current_state = Column(
        Enum("STOPPED", "STARTING", "RUNNING", "PAUSED", "ERROR", "EMERGENCY_STOP", name="robot_state_enum"),
        default="STOPPED", nullable=False
    )
    block_new_entries = Column(Boolean, default=False, nullable=False)
    is_real_armed = Column(Boolean, default=False, nullable=False)
    last_signal = Column(JSONB, nullable=True)
    last_entry_time = Column(DateTime, nullable=True)
    daily_pnl = Column(Numeric(12, 2), default=0.0)
    total_pnl = Column(Numeric(12, 2), default=0.0)
    consecutive_losses = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    account = relationship("BrokerAccount", back_populates="instance")

class WorkerNode(Base):
    __tablename__ = "worker_nodes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    node_identifier = Column(String(100), unique=True, nullable=False)
    ip_address = Column(String(45), nullable=True)
    hostname = Column(String(120), nullable=True)
    status = Column(Enum("ONLINE", "OFFLINE", "DEGRADED", name="worker_status_enum"), default="OFFLINE")
    last_heartbeat = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class WorkerAssignment(Base):
    __tablename__ = "worker_assignments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("broker_accounts.id", ondelete="CASCADE"), unique=True, nullable=False)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("worker_nodes.id", ondelete="CASCADE"), nullable=False)
    lease_token = Column(UUID(as_uuid=True), default=uuid.uuid4, nullable=False)
    lease_expires_at = Column(DateTime, nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)

class CommandQueue(Base):
    __tablename__ = "command_queue"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("broker_accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    idempotency_key = Column(String(100), unique=True, nullable=False, index=True)
    command_type = Column(
        Enum("START", "PAUSE", "RESUME", "STOP", "RESTART", "BLOCK_ENTRIES", "UNBLOCK_ENTRIES", "EMERGENCY_STOP", "CLOSE_ALL", "CANCEL_PENDING", name="cmd_type_enum"),
        nullable=False
    )
    parameters = Column(JSONB, default=dict)
    status = Column(Enum("PENDING", "DISPATCHED", "COMPLETED", "FAILED", "CANCELLED", name="cmd_status_enum"), default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    account_id = Column(UUID(as_uuid=True), nullable=True)
    worker_id = Column(UUID(as_uuid=True), nullable=True)
    severity = Column(Enum("INFO", "WARNING", "ERROR", "CRITICAL", name="log_severity_enum"), default="INFO")
    component = Column(String(80), nullable=False)
    event = Column(String(80), nullable=False)
    message = Column(Text, nullable=False)
    idempotency_key = Column(String(100), nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="audit_logs")
