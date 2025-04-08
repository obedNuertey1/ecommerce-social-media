from pandas import DataFrame
import numpy as np
from threadspipepy.threadspipe import ThreadsPipe
from werkzeug import utils
def load_pandas():
    return dir(DataFrame)

def load_numpy():
    return dir(np)

def load_threadspipe():
    return dir(ThreadsPipe)

def load_werkzeug():
    return dir(utils)