FROM rabbitmq:management
ADD rabbitmq.conf /etc/rabbitmq/
ADD definitions.json /etc/rabbitmq/
ADD certs/CA.pem /etc/rabbitmq/certs/CA.pem
ADD certs/cert.pem /etc/rabbitmq/certs/cert.pem
ADD certs/key.pem /etc/rabbitmq/certs/key.pem
RUN chown rabbitmq:rabbitmq /etc/rabbitmq/rabbitmq.conf /etc/rabbitmq/definitions.json  /etc/rabbitmq/certs/key.pem /etc/rabbitmq/certs/cert.pem /etc/rabbitmq/certs/CA.pem
EXPOSE 15672
EXPOSE 5671
EXPOSE 5672
CMD ["rabbitmq-server"]