from sshtunnel import SSHTunnelForwarder  
import os

class Config:
    SECRET_KEY = "3f880a148e7001b192e4913d7625f7af65a29eb3b8cb56861cae3a0bb3fe2f30"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SSH_HOST = '85.95.150.8'
    SSH_PORT = 22
    SSH_USERNAME = 'alex_a'
    SSH_PASSWORD = 'Xt,ehfirf2025'  

    MYSQL_USER = 'root'
    MYSQL_PASSWORD = 'passw' 
    MYSQL_DB = 'AleynikovAD_db1'

    server = SSHTunnelForwarder(
        (SSH_HOST, SSH_PORT),
        ssh_username=SSH_USERNAME,
        ssh_password=SSH_PASSWORD,  
        remote_bind_address=('127.0.0.1', 3306)
    )
    server.start()

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}"
        f"@127.0.0.1:{server.local_bind_port}/{MYSQL_DB}"
    )
