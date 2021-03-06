from platypush.message.event import Event


class SensorDataChangeEvent(Event):
    """
    Event triggered when a sensor has new data
    """

    def __init__(self, data, *args, **kwargs):
        """
        :param data: Sensor data
        :type data: object
        """

        super().__init__(data=data, *args, **kwargs)
        self.data = data


class SensorDataAboveThresholdEvent(Event):
    """
    Event triggered when a sensor's read goes above a configured threshold
    """

    def __init__(self, data, *args, **kwargs):
        """
        :param data: Sensor data
        :type data: object
        """

        super().__init__(data=data, *args, **kwargs)
        self.data = data


class SensorDataBelowThresholdEvent(Event):
    """
    Event triggered when a sensor's read goes below a configured threshold
    """

    def __init__(self, data, *args, **kwargs):
        """
        :param data: Sensor data
        :type data: object
        """

        super().__init__(data=data, *args, **kwargs)
        self.data = data


# vim:sw=4:ts=4:et:
